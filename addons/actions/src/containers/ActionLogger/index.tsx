import React, { Component } from 'react';
import deepEqual from 'fast-deep-equal';

import { STORY_RENDERED, STORY_CHANGED } from '@storybook/core-events';

import { ActionLogger as ActionLoggerComponent } from '../../components/ActionLogger';
import { EVENT_ID, HANDLER_REGISTERED_ID } from '../..';
import { ActionDisplay, ActionHandler } from '../../models';

interface ActionLoggerProps {
  active: boolean;
  api: {
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
  };
}

interface ActionLoggerState {
  rendered: boolean;
  handlers: ActionHandler[];
  actions: ActionDisplay[];
}

export default class ActionLogger extends Component<ActionLoggerProps, ActionLoggerState> {
  private mounted: boolean;

  constructor(props: ActionLoggerProps) {
    super(props);

    this.state = {
      rendered: false,
      handlers: [],
      actions: [],
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { api } = this.props;

    api.on(HANDLER_REGISTERED_ID, this.registerHandler);
    api.on(EVENT_ID, this.addAction);
    api.on(STORY_RENDERED, this.handleStoryChange);
    api.on(STORY_CHANGED, this.clearHandlers);
  }

  componentWillUnmount() {
    this.mounted = false;
    const { api } = this.props;

    api.off(HANDLER_REGISTERED_ID, this.registerHandler);
    api.off(STORY_RENDERED, this.handleStoryChange);
    api.off(EVENT_ID, this.addAction);
    api.off(STORY_CHANGED, this.clearHandlers);
  }

  handleStoryChange = () => {
    const { actions } = this.state;
    if (actions.length > 0 && actions[0].options.clearOnStoryChange) {
      this.clearActions();
    }

    this.setState({
      rendered: true,
    });
  };

  registerHandler = (name: string) => {
    const { rendered, handlers } = this.state;

    if (handlers.some(h => h.name === name && h.dynamic)) {
      return;
    }

    const handler: ActionHandler = {
      name,
      dynamic: rendered,
    };

    this.setState({
      handlers: [...handlers, handler],
    });
  };

  clearHandlers = () => {
    this.setState({
      rendered: false,
      handlers: [],
    });
  };

  addAction = (action: ActionDisplay) => {
    let { actions = [] } = this.state;
    actions = [...actions];

    const previous = actions.length && actions[0];

    if (previous && deepEqual(previous.data, action.data)) {
      previous.count++; // eslint-disable-line
    } else {
      action.count = 1; // eslint-disable-line
      actions.unshift(action);
    }
    this.setState({ actions: actions.slice(0, action.options.limit) });
  };

  clearActions = () => {
    this.setState({ actions: [] });
  };

  render() {
    const { handlers, actions = [] } = this.state;
    const { active } = this.props;
    const props = {
      handlers,
      actions,
      onClear: this.clearActions,
    };
    return active ? <ActionLoggerComponent {...props} /> : null;
  }
}
