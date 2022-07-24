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
          actions: [
            assign((ctx) => {
              return {
                ...ctx,
                object: {
                  ...ctx.object,
                  newField: {},
                },
              }
            }),
            assign((ctx) => {
              return {
                ...ctx,
                object: {
                  ...ctx.object,
                  newField2: {},
                },
              }
            }),
          ]
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

class SerivceConnector {
  mapServiceToPreviousState = new Map<
    Interpreter<any, any, any, any, any>,
    { 
      state: State<any, any, any, any, any>,
      context: any,
    } | null
  >();

  mapServiceToListeningFields = new Map<
    Interpreter<any, any, any, any, any>,
    Set<string>
  >();

  connect(service: Interpreter<any, any, any, any, any>) {
    service.onTransition((state) => {
      this.diffContext(service, state);
      this.mapServiceToPreviousState.set(service, {
        state,
        context: state.context,
      });
    });
    this.mapServiceToPreviousState.set(service, null);
    this.mapServiceToListeningFields.set(service, new Set<string>());
  }

  addListeningFields(service: Interpreter<any, any, any, any, any>, ...fields: string[]) {
    const fieldsSet = this.mapServiceToListeningFields.get(service)
    if (!fieldsSet) throw new Error(`Not exists service: ${service}`);
    fields.forEach(field => fieldsSet.add(field));
  }

  private diffContext(service: Interpreter<any, any, any, any, any>, newState: State<any, any, any, any, any>) {
    const fieldsSet = this.mapServiceToListeningFields.get(service)
    if (!fieldsSet) throw new Error(`Not exists service: ${service}`);

    const previousState = this.mapServiceToPreviousState.get(service);
    if (!previousState) throw new Error(`Not initialized servcie: ${service}`);

    const listeningKeys = [...fieldsSet].map(str => str.split('.'));

    listeningKeys.forEach(keys => {
      const {
        previousValue,
        newValue,
      } = keys.reduce((acc, key) => {
        return {
          previousValue: acc.previousValue[key],
          newValue: acc.newValue[key],
        };
      }, {
        previousValue: previousState.context,
        newValue: newState.context,
      });
      
      if (previousValue !== newValue) {
        if (typeof previousValue === 'object' && previousValue !== null && typeof newValue === 'object' && newValue !== null) {
          // message send
        } else {
          // just send
        }
      }
    });
  }
}

const serviceConnector = new SerivceConnector();
serviceConnector.connect(messageCommunicationService);