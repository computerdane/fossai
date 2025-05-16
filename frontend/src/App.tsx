import "./App.css";
import {
  Box,
  Flex,
  IconButton,
  Select,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, Pencil2Icon } from "@radix-ui/react-icons";

function App() {
  return (
    <Flex className="h-dvh">
      <Flex direction="column" className="w-xs" p="1" gap="1">
        <Flex gap="1">
          <TextField.Root
            placeholder="Search chats..."
            variant="soft"
            radius="full"
            className="grow"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
          <Tooltip content="New chat">
            <IconButton variant="soft">
              <Pencil2Icon />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>
      <Flex direction="column" flexGrow="1" p="1">
        <Box>
          <Select.Root defaultValue="gpt-4.1">
            <Select.Trigger variant="soft" />
            <Select.Content position="popper">
              <Select.Item value="gpt-4.1">gpt-4.1</Select.Item>
              <Select.Item value="gpt-4o">gpt-4o</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
        <Flex flexGrow="1">chatarea</Flex>
        <TextArea
          size="3"
          radius="large"
          placeholder="Write a message to MODEL"
        />
      </Flex>
    </Flex>
  );
}

export default App;
