import React, { Fragment } from 'react';
import { styled, withTheme } from '@storybook/theming';

import Inspector from 'react-inspector';
import { ActionBar, ScrollArea } from '@storybook/components';

import { Action, InspectorContainer, Counter, Handlers } from './style';
import { ActionDisplay, ActionHandler } from '../../models';

export const Wrapper = styled(({ children, className }) => (
  <ScrollArea horizontal vertical className={className}>
    {children}
  </ScrollArea>
))({
  margin: 0,
  padding: '10px 5px 20px',
});

const ThemedInspector = withTheme(({ theme, ...props }) => (
  <Inspector theme={theme.addonActionsTheme || 'chromeLight'} {...props} />
));

interface ActionLoggerProps {
  handlers: ActionHandler[];
  actions: ActionDisplay[];
  onClear: () => void;
}

export const ActionLogger = ({ handlers, actions, onClear }: ActionLoggerProps) => (
  <Fragment>
    <Wrapper title="actionslogger">
      {actions.map((action: ActionDisplay) => (
        <Action key={action.id}>
          {action.count > 1 && <Counter>{action.count}</Counter>}
          <InspectorContainer>
            <ThemedInspector
              sortObjectKeys
              showNonenumerable={false}
              name={action.data.name}
              data={action.data.args || action.data}
            />
          </InspectorContainer>
        </Action>
      ))}
    </Wrapper>

    <Handlers>
      <h3>Handlers:</h3>
      {handlers.length ? (
        handlers.map((h, i) => (
          <div key={i}>
            - {h.dynamic && '*'} {h.name}
          </div>
        ))
      ) : (
        <div>No registered handlers.</div>
      )}
    </Handlers>

    <ActionBar actionItems={[{ title: 'Clear', onClick: onClear }]} />
  </Fragment>
);
