import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';

const script = readFileSync('src/frontend/js/services/uiState.js', 'utf8');

class FakeElement {
  className = '';
  hidden = false;
  textContent = '';
  dataset: Record<string, string> = {};
  children: FakeElement[] = [];
  attributes: Record<string, string> = {};
  classList = {
    add: (...names: string[]) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      names.forEach((name) => classes.add(name));
      this.className = [...classes].join(' ');
    },
    remove: (...names: string[]) => {
      const removed = new Set(names);
      this.className = this.className.split(/\s+/).filter((name) => name && !removed.has(name)).join(' ');
    }
  };

  setAttribute(name: string, value: string) { this.attributes[name] = value; }
  removeAttribute(name: string) { delete this.attributes[name]; }
  append(...children: FakeElement[]) { this.children.push(...children); }
  appendChild(child: FakeElement) { this.children.push(child); return child; }
  replaceChildren(...children: FakeElement[]) { this.children = children; }
}

function loadHelper() {
  const document = {
    head: new FakeElement(),
    createElement: () => new FakeElement(),
    getElementById: () => null,
    querySelector: () => null
  };
  const context: Record<string, any> = { document };
  context.window = context;
  runInNewContext(script, context);
  return context.PulseUiState;
}

describe('PulseUiState', () => {
  it('renderiza loading e erro com mensagens acessíveis', () => {
    const helper = loadHelper();
    const target = new FakeElement();

    helper.set(target, 'loading', 'Consultando dados...');
    expect(target.className).toContain('pulse-ui-state--loading');
    expect(target.attributes.role).toBe('status');
    expect(target.children[0].children[1].textContent).toBe('Consultando dados...');

    helper.set(target, 'error', 'API indisponível.');
    expect(target.className).toContain('pulse-ui-state--error');
    expect(target.attributes.role).toBe('alert');

    helper.set(target, 'success', 'Dados atualizados.');
    expect(target.className).toContain('pulse-ui-state--success');
    expect(target.attributes.role).toBe('status');
  });

  it('renderiza vazio dentro de listas sem quebrar o contêiner', () => {
    const helper = loadHelper();
    const list = new FakeElement();

    helper.set(list, 'empty', 'Nenhum registro.', { replace: true });
    expect(list.dataset.pulseUiState).toBe('empty');
    expect(list.className).toContain('pulse-ui-state-host');
    expect(list.children[0].children[1].textContent).toBe('Nenhum registro.');
  });

  it('normaliza mensagens e identifica coleções vazias', () => {
    const helper = loadHelper();
    expect(helper.messageFrom(new Error('Falha amigável.'), 'Fallback')).toBe('Falha amigável.');
    expect(helper.messageFrom({}, 'Fallback')).toBe('Fallback');
    expect(helper.isEmpty([])).toBe(true);
    expect(helper.isEmpty([1])).toBe(false);
  });
});
