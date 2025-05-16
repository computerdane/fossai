import { useContext, useState } from "react";
import "./Login.css";
import { EnvContext, HonoContext } from "./main";
import {
  Button,
  Flex,
  Tabs,
  TextField,
  Text,
  Card,
  Box,
  Heading,
} from "@radix-ui/themes";
import { Form } from "radix-ui";
import backdrop from "./assets/backdrop.png";

function Login({ setToken }: { setToken: (token: string) => void }) {
  const client = useContext(HonoContext);
  const env = useContext(EnvContext);
  const [errorMessage, setErrorMessage] = useState<string>();

  async function login(formData: FormData) {
    const res = await client.login.$post({
      json: { email: formData.get("email")!.toString() },
    });
    if (res.ok) {
      const { token } = await res.json();
      setToken(token);
    } else {
      setErrorMessage("Login failed.");
    }
  }

  return (
    <Flex
      direction="column"
      className="h-dvh bg-cover"
      style={{ backgroundImage: `url(${backdrop})` }}
    >
      <Box className="m-auto">
        <Card>
          <Flex direction="column">
            <Heading size="8" align="center">
              {env.LOGIN_PAGE_TITLE}
            </Heading>
            <Heading size="3" align="center" mb="5">
              {env.LOGIN_PAGE_SUBTITLE}
            </Heading>
            <Tabs.Root
              defaultValue="login"
              onValueChange={() => setErrorMessage(undefined)}
            >
              <Tabs.List justify="center">
                <Tabs.Trigger value="login">Login</Tabs.Trigger>
                <Tabs.Trigger value="register">Register</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="login">
                <Form.Root className="form-root" action={login}>
                  <Form.Field name="email">
                    <Flex align="baseline" justify="between">
                      <Form.Label>Email</Form.Label>
                      <Form.Message
                        className="form-message"
                        match="valueMissing"
                      >
                        Please enter your email
                      </Form.Message>
                      <Form.Message
                        className="form-message"
                        match="typeMismatch"
                      >
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
                      <Form.Message
                        className="form-message"
                        match="valueMissing"
                      >
                        Please enter your email
                      </Form.Message>
                      <Form.Message
                        className="form-message"
                        match="typeMismatch"
                      >
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
                      <Form.Message
                        className="form-message"
                        match="valueMissing"
                      >
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
            {errorMessage && (
              <Text color="red" align="center" mt="2">
                {errorMessage}
              </Text>
            )}
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}

export default Login;
