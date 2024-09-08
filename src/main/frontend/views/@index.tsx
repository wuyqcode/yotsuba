import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { useSignal } from '@vaadin/hilla-react-signals';
import { Button } from '@vaadin/react-components/Button.js';
import { Notification } from '@vaadin/react-components/Notification.js';
import { TextField } from '@vaadin/react-components/TextField.js';
import { HelloWorldEndpoint } from 'Frontend/generated/endpoints.js';

export const config: ViewConfig = {
  menu: { order: 0, icon: 'HomeIcon' },
  title: 'Home'
};

export default function HelloWorldView() {
  const name = useSignal('');

  return (
    <>
      <section className="flex p-m gap-m items-end">
        <TextField
          label="Your name"
          onValueChanged={(e) => {
            name.value = e.detail.value;
          }}
        />
        <Button
          onClick={async () => {
            const serverResponse = await HelloWorldEndpoint.sayHello(
              name.value
            );
            Notification.show(serverResponse ?? '');
          }}
        >
          Say hello
        </Button>
      </section>
    </>
  );
}
