import { assign, createMachine, interpret, Interpreter, State } from "xstate";

const messageCommunicationContext = {
  a: 10,
  b: 'string',
  c: false,
  object: {
    a: {
      nested: 10,
    },
    b: {},
    c: {},
    d: {},
  },
};

const messageCommunicationMachine = createMachine<typeof messageCommunicationContext>({
  id: 'messageCommunication',
  context: messageCommunicationContext,
  initial: 'listen',
  states: {
    listen: {
      on: {
        PING: {
          actions() {
            console.log('[PONG]');
          },
        },
        NEW_FIELD: {
          actions: assign((ctx) => {
            return {
              ...ctx,
              object: {
                ...ctx.object,
                newField: {},
              },
            }
          }),
        }
      }
    }
  }
});

const pingButton = document.getElementById('ping')!;
pingButton.onclick = () => messageCommunicationService.send('PING');

const newField = document.getElementById('newField')!;
newField.onclick = () => messageCommunicationService.send('NEW_FIELD');

const messageCommunicationService = interpret(messageCommunicationMachine);
messageCommunicationService.start();

function connectService(service: Interpreter<any, any, any, any, any>) {
  let previousContext: State<any, any, any, any, any>;
  service.onTransition((state) => {
    console.log('[previousContext]', previousContext);
    console.log('[currentContext]', state.context)
    previousContext = state.context;
  });
}

connectService(messageCommunicationService);