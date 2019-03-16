import React, { Component, Fragment } from 'react';
import { SyntaxHighlighter } from '@storybook/components';
import Eventtypes, { STORY_RENDERED } from '@storybook/core-events';

import { EVENTS, PARAM_KEY } from './constants';
import { CssResource } from './CssResource';

interface CssResourcePanelProps {
  active: boolean;
  api: {
    emit(event: any, data: any): void;
    on(event: Eventtypes, callback: (data: any) => void): void;
    off(event: Eventtypes, callback: (data: any) => void): void;
    getQueryParam(): void;
    getParameters(id: string, paramKey: string): any;
    setQueryParams(): void;
  };
}

interface CssResourcePanelState {
  currentStoryId: string;
  list: CssResource[];
}

interface CssResourceLookup {
  [key: string]: CssResource;
}

export class CssResourcePanel extends Component<CssResourcePanelProps, CssResourcePanelState> {
  constructor(props: CssResourcePanelProps) {
    super(props);

    this.state = {
      currentStoryId: '',
      list: [],
    };
  }

  componentDidMount() {
    const { api } = this.props;
    api.on(STORY_RENDERED, this.onStoryChange);
  }

  componentWillUnmount() {
    const { api } = this.props;
    api.off(STORY_RENDERED, this.onStoryChange);
  }

  onStoryChange = (id: string) => {
    const { list: currentList, currentStoryId } = this.state;
    const { api } = this.props;
    const list = api.getParameters(id, PARAM_KEY) as CssResource[];

    if (list && currentStoryId !== id) {
      const existingIds = currentList.reduce((lookup: CssResourceLookup, res) => {
        lookup[res.id] = res;
        return lookup;
      }, {}) as CssResourceLookup;
      const mergedList = list.map(res => {
        const existingItem = existingIds[res.id];
        return existingItem
          ? {
              ...res,
              picked: existingItem.picked,
            }
          : res;
      });
      const picked = mergedList.filter(res => res.picked);
      this.setState({ list: mergedList, currentStoryId: id }, () => this.emit(picked));
    }
  };

  onChange = (event: any) => {
    const { list: oldList } = this.state;
    const list = oldList.map(i => ({
      ...i,
      picked: i.id === event.target.id ? event.target.checked : i.picked,
    }));
    this.setState({ list }, () => this.emit(list.filter((res: any) => res.picked)));
  };

  emit(list: CssResource[]) {
    const { api } = this.props;
    api.emit(EVENTS.SET, list);
  }

  render() {
    const { list } = this.state;
    const { active } = this.props;

    if (!active) {
      return null;
    }

    return (
      <Fragment>
        {list &&
          list.map(({ id, code, picked }) => (
            <div key={id} style={{ padding: 10 }}>
              <label>
                <input type="checkbox" checked={picked} onChange={this.onChange} id={id} />
                <span>#{id}</span>
              </label>
              {code ? <SyntaxHighlighter language="html">{code}</SyntaxHighlighter> : null}
            </div>
          ))}
      </Fragment>
    );
  }
}
