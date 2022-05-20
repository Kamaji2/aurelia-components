import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import ClassicEditor from './ckeditor';

require('./ka-control-editor.sass');

@customElement('ka-control-editor')
@inject(Element)
export class KaControlEditor {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  constructor(element) {
    this.element = element;
  }

  attached() {}

  schemaChanged(schema) {
    this.readonly = schema.readonly || false;
    this.buildEditor();
  }

  valueChanged(value) {
    if (!this.editor || this.editorValuePending || this.editor.getData() === value) return;
    console.debug('ka-control-editor: value changed!', value);
    this.editorValuePending = true;
    this.editor.setData(value || '');
    setTimeout(() => { this.editorValuePending = false; }, 0);
  }

  readonlyChanged(readonly) {
    if (!this.editor) return;
    if (readonly) this.editor.enableReadOnlyMode('ka-control-editor');
    else this.editor.disableReadOnlyMode('ka-control-editor');
  }

  buildEditor() {
    if (this._editor_initialized) return;
    let config = {
      removePlugins: ['Markdown', 'MediaEmbedToolbar'],
      toolbar: {
        items: [
          'heading',
          '|',
          'bold',
          'italic',
          'strikethrough',
          'superscript',
          'subscript',
          'removeFormat',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'alignment',
          'indent',
          'outdent',
          '|',
          'code',
          'codeBlock',
          '|',
          'link',
          'blockQuote',
          'insertTable',
          'imageInsert',
          'mediaEmbed',
          'htmlEmbed',
          '|',
          'undo',
          'redo',
          'findAndReplace',
          '|',
          'sourceEditing'
        ]
      },
      language: 'it',
      mediaEmbed: {},
      image: {
        toolbar: [
          'imageStyle:inline',
          'imageStyle:block',
          'imageStyle:side',
          '|',
          'toggleImageCaption',
          'imageTextAlternative'
        ]
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
          'tableCellProperties'
        ]
      }
    };
    ClassicEditor.create(this.element.querySelector('div'), config).then(editor => {
      editor.setData(this.value || '');
      if (this.schema.readonly) editor.enableReadOnlyMode('ka-control-editor');
      editor.model.document.on('change:data', () => { this.value = editor.getData(); });
      this.editor = editor;
    }).catch(error => {
      console.error('There was a problem initializing ckeditor', error );
    }).finally(() => {
      this._editor_initialized = true;
    });
  }
}
