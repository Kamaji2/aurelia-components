import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import ClassicEditor from 'ka-ckeditor';


@customElement('ka-control-editor')
@inject(Element)
export class KaControlEditor {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;

  constructor(element) {
    this.element = element;
  }

  attached() {}

  schemaChanged(schema) {
    // Validate schema
    if (!schema) {
      konsole.warn('ka-control-editor: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        konsole.error('ka-control-editor: invalid schema provided!', schema);
        return;
      }
    }

    // Thisify boolean schema attributes
    for (let attribute of ['readonly']) {
      if (this[attribute] === null) {
        if (this.element.getAttribute(attribute)) {
          this[attribute] = String(this.element.getAttribute(attribute)).toLowerCase() === 'true';
        } else if (typeof schema[attribute] !== undefined) {
          this[attribute] = String(schema[attribute]).toLowerCase() === 'true';
        }
      } else this[attribute] = String(this[attribute]).toLowerCase() === 'true';
    }

    konsole.debug('ka-control-editor: schema changed!', schema);
    this._schema = schema;

    this.buildEditor();
  }

  valueChanged(value) {
    if (!this.editor || this.editorValuePending || this.editor.getData() === value) return;
    konsole.debug('ka-control-editor: value changed!', value);
    this.editorValuePending = true;
    this.editor.setData(value || '');
    setTimeout(() => { this.editorValuePending = false; }, 0);
  }

  readonlyChanged(readonly) {
    if (this.editor) this.editor.isReadOnly = readonly;
  }

  buildEditor() {
    if (this._editor_initialized) return;
    let config = {
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
          'link',
          'imageUpload',
          'blockQuote',
          'insertTable',
          'mediaEmbed',
          'undo',
          'redo',
          '|',
          'code'
        ]
      },
      language: 'it',
      image: {
        toolbar: [
          'imageTextAlternative',
          'imageStyle:full',
          'imageStyle:side'
        ]
      },
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells'
        ]
      }
    };
    ClassicEditor.create(this.element, config).then(editor => {
      editor.setData(this.value || '');
      editor.isReadOnly = this.readonly;
      editor.model.document.on('change:data', () => { this.value = editor.getData(); });
      this.editor = editor;
    }).catch(error => {
      konsole.error('There was a problem initializing ckeditor', error );
    }).finally(() => {
      this._editor_initialized = true;
    });
  }
}
