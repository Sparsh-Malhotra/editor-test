import {
  ContentBlock,
  DraftHandleValue,
  Editor,
  EditorState,
  Modifier,
  convertFromRaw,
  convertToRaw,
} from "draft-js";
import { useState, KeyboardEvent } from "react";
import "draft-js/dist/Draft.css";
import "./App.css";

function App() {
  const [editorState, setEditorState] = useState(() => {
    const storedContent = localStorage.getItem("editor_text");
    if (storedContent) {
      const contentState = convertFromRaw(JSON.parse(storedContent));
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  const handleBeforeInput = (char: string, editorState: EditorState) => {
    const currentContentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const currentBlock = currentContentState.getBlockForKey(
      selection.getStartKey()
    );
    const currentText = currentBlock.getText();

    if (char === " " && currentText.trim() === "#") {
      // Convert the block type to heading-one
      const newContentState = Modifier.setBlockType(
        currentContentState,
        selection,
        "header-one"
      );

      // Remove the '#' character
      const finalContentState = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: selection.getStartOffset() - 1,
          focusOffset: selection.getStartOffset(),
        }),
        ""
      );

      // Update editor state with the heading block
      const newEditorState = EditorState.push(
        editorState,
        finalContentState,
        "change-block-type"
      );

      setEditorState(newEditorState);

      return "handled";
    }

    if (char === " " && currentText.trim() === "*") {
      const newContentState = Modifier.setBlockType(
        currentContentState,
        selection,
        "BOLD"
      );

      // Remove '*' and space at the start of the line
      const contentStateWithoutStar = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        "" // Replace with an empty string
      );

      // Update editor state with the heading block
      const newEditorState = EditorState.push(
        editorState,
        contentStateWithoutStar,
        "change-block-type"
      );

      setEditorState(newEditorState);

      return "handled";
    }

    if (char === " " && currentText.trim() === "**") {
      const newContentState = Modifier.setBlockType(
        currentContentState,
        selection,
        "RED_LINE"
      );

      const contentStateWithoutStar = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithoutStar,
        "change-block-type"
      );

      setEditorState(newEditorState);

      return "handled";
    }

    if (char === " " && currentText.trim() === "***") {
      const newContentState = Modifier.setBlockType(
        currentContentState,
        selection,
        "UNDERLINE"
      );

      const contentStateWithoutStar = Modifier.replaceText(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        ""
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithoutStar,
        "change-block-type"
      );

      setEditorState(newEditorState);

      return "handled";
    }

    return "not-handled";
  };

  const customBlockStyleFn = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType();
    if (type === "RED_LINE") {
      return "red-text";
    } else if (type === "UNDERLINE") {
      return "underline";
    } else if (type === "BOLD") {
      return "bold";
    }
    return "";
  };

  const handleReturn = (
    _e: KeyboardEvent<{}>,
    editorState: EditorState
  ): DraftHandleValue => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // Split the block without any specific block type
    const newContentState = Modifier.splitBlock(contentState, selectionState);

    // Set the block type to unstyled
    const contentStateWithUnstyled = Modifier.setBlockType(
      newContentState,
      newContentState.getSelectionAfter(),
      "unstyled"
    );

    // Update editor state with the new block
    const newEditorState = EditorState.push(
      editorState,
      contentStateWithUnstyled,
      "split-block"
    );

    setEditorState(newEditorState);

    return "handled";
  };

  const handleSaveText = () => {
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editor_text", contentStateJSON);
  };

  return (
    <div className="main-container">
      <div className="sub-container">
        <div className="header">
          <h2 className="header-text">Editor by Sparsh</h2>
          <button type="button" className="save-btn" onClick={handleSaveText}>
            Save
          </button>
        </div>
        <div className="editor-container">
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            handleBeforeInput={handleBeforeInput}
            blockStyleFn={customBlockStyleFn}
            handleReturn={handleReturn}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
