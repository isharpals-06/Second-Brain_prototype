import { eventBus } from '../events/EventBus';

export class CommandLayer {
  constructor() {
    this.commands = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.register('sys_toggle_command_palette', 'Toggle Command Palette', ['Control', 'k'], () => {
      eventBus.emit('ToggleCommandPalette');
    });

    this.register('sys_toggle_inspector', 'Toggle Context Inspector', ['Control', 'b'], () => {
      eventBus.emit('ToggleInspector');
    });
  }

  register(id, label, keyCombo, handler) {
    this.commands.set(id, { id, label, keyCombo, handler });
  }

  execute(id, payload = {}) {
    const cmd = this.commands.get(id);
    if (cmd) {
      cmd.handler(payload);
      eventBus.emit('CommandExecuted', { id, label: cmd.label });
      return true;
    }
    return false;
  }

  listCommands() {
    return Array.from(this.commands.values());
  }
}

export const commandLayer = new CommandLayer();
