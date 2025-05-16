import { useContext, useState } from "react";
import "./Login.css";
import { HonoContext } from "./main";
import { Button, Flex, Tabs, TextField, Text } from "@radix-ui/themes";
import { Form } from "radix-ui";

function Login({ setToken }: { setToken: (token: string) => void }) {
  const client = useContext(HonoContext);
  const [failed, setFailed] = useState(false);

  async function login(formData: FormData) {
    const res = await client.login.$post({
      json: { email: formData.get("email")!.toString() },
    });
    if (res.ok) {
      const { token } = await res.json();
      setToken(token);
    } else {
      setFailed(true);
    }
  }

  return (
    <Flex className="h-dvh bg-linear-65 from-indigo-700 to-pink-700">
      <Flex
        direction="column"
        className="m-auto bg-white p-4 rounded-xl shadow-xl"
      >
        <Text size="8" align="center">
          fossai
        </Text>
        <Text size="3" align="center" mb="5">
          Free AI.
        </Text>
        <Tabs.Root defaultValue="login">
          <Tabs.List justify="center">
            <Tabs.Trigger value="login">Login</Tabs.Trigger>
            <Tabs.Trigger value="register">Register</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="login">
            <Form.Root className="form-root" action={login}>
              <Form.Field name="email">
                <Flex align="baseline" justify="between">
                  <Form.Label>Email</Form.Label>
                  <Form.Message className="form-message" match="valueMissing">
                    Please enter your email
                  </Form.Message>
                  <Form.Message className="form-message" match="typeMismatch">
                    Please provide a valid email
                  </Form.Message>
                </Flex>
                <Form.Control asChild>
                  <TextField.Root type="email" required />
                </Form.Control>
              </Form.Field>
              <Form.Submit asChild>
                <Button className="form-button">Login</Button>
              </Form.Submit>
            </Form.Root>
          </Tabs.Content>
          <Tabs.Content value="register">
            <Form.Root className="form-root">
              <Form.Field name="email">
                <Flex align="baseline" justify="between">
                  <Form.Label>Email</Form.Label>
                  <Form.Message className="form-message" match="valueMissing">
                    Please enter your email
                  </Form.Message>
                  <Form.Message className="form-message" match="typeMismatch">
                    Please provide a valid email
                  </Form.Message>
                </Flex>
                <Form.Control asChild>
                  <TextField.Root type="email" required />
                </Form.Control>
              </Form.Field>
              <Form.Field name="first_name">
                <Flex align="baseline" justify="between">
                  <Form.Label>First Name</Form.Label>
                  <Form.Message className="form-message" match="valueMissing">
                    Please enter your first name
                  </Form.Message>
                </Flex>
                <Form.Control asChild>
                  <TextField.Root required />
                </Form.Control>
              </Form.Field>
              <Form.Submit asChild>
                <Button className="form-button">Register</Button>
              </Form.Submit>
            </Form.Root>
          </Tabs.Content>
        </Tabs.Root>
        {failed && (
          <Text color="red" align="center" mt="2">
            Login failed.
          </Text>
        )}
      </Flex>
    </Flex>
  );
}

export default Login;
