import Head from 'next/head';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  useColorMode,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { LoginButton } from '@/components/buttons/login-button';
import NavBar from '../components/NavBar';
import { withPageAuthRequired, useUser } from '@auth0/nextjs-auth0/client';
import { DateTime } from 'luxon';
import { LogoutButton } from '@/components/buttons/logout-button';

const Dashboard = () => {
  const { user, error, isLoading } = useUser();
  const [text, setText] = useState('');
  const [apiResponse, setApiResponse] = useState([]);
  const [calendarChanges, setCalendarChanges] = useState([]);
  const [invalidResponse, setInvalidResponse] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGeminiLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();

      if (data.content && data.content.response === "I can only help with updating Google Calendar.") {
        setInvalidResponse(true);
        setCalendarChanges([]);
      } else {
        setApiResponse(data.content || []);
        setCalendarChanges(data.content || []);
        setInvalidResponse(false);
      }

      onOpen();
    } catch (error) {
      console.error(error);
      setApiResponse(['Error fetching data from Google Gemini API: ' + error.message]);
      setInvalidResponse(false);
      onOpen();
    } finally {
      setGeminiLoading(false);
    }
  };
  
  const createCalendarEvent = async () => {
    setCalendarLoading(true);

    try {
      const response = await fetch('/api/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes: calendarChanges }),
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();
      toast({
        title: 'Events processed successfully',
        description: `Check your Google Calendar for updates.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error processing events',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCalendarLoading(false);
    }
  };

  if (isLoading) return (
    <Flex justify="center" align="center" height="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Spinner size="xl" color={useColorModeValue('blue.500', 'blue.300')} />
    </Flex>
  );
  if (error) return <Text color="red.500" textAlign="center" mt={8}>{error.message}</Text>;

  return (
    <Container maxW="container.lg" centerContent py={8}>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Enhanced dashboard with modern design" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <Box w="full" p={6} borderWidth={1} borderRadius="lg" bg={useColorModeValue('white', 'gray.800')} boxShadow="lg">
        <Heading mb={4} textAlign="center" color={useColorModeValue('blue.600', 'blue.300')} fontSize="3xl" fontWeight="bold">
          Dashboard
        </Heading>
        <Text mb={4} textAlign="center" color={useColorModeValue('gray.600', 'gray.300')} fontSize="lg">
          Welcome to your dashboard, {user.name}, {user.email}.
        </Text>

        <VStack as="form" spacing={6} onSubmit={handleSubmit}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter some text"
            borderColor={useColorModeValue('gray.300', 'gray.600')}
            focusBorderColor={useColorModeValue('blue.500', 'blue.300')}
            size="lg"
            borderRadius="md"
            p={4}
          />
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={geminiLoading}
            loadingText="Generating"
            size="lg"
            width="full"
            borderRadius="md"
            boxShadow="md"
            _hover={{ bg: useColorModeValue('blue.600', 'blue.400') }}
            _active={{ bg: useColorModeValue('blue.700', 'blue.500') }}
          >
            Submit
          </Button>
        </VStack>

        {Array.isArray(apiResponse) && apiResponse.length > 0 && !invalidResponse && (
          <Box mt={8} p={4} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md" boxShadow="md">
            <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.600', 'blue.300')}>
              Response from Google Gemini:
            </Text>
            <Divider my={4} />
            {apiResponse.map((item, index) => (
              <Box key={index} borderWidth={1} borderRadius="md" p={4} mb={4} bg={useColorModeValue('white', 'gray.600')} boxShadow="sm">
                <Text fontWeight="bold" color={useColorModeValue('blue.700', 'blue.400')}>{item.summary}</Text>
                <Text color={useColorModeValue('gray.600', 'gray.300')}>{item.description}</Text>
                <Text color={useColorModeValue(item.event_type === 'create' ? 'green.500' : 'red.500', item.event_type === 'create' ? 'green.300' : 'red.300')}>
                  {item.event_type === 'create' ? (
                    `${DateTime.fromISO(item.start).toLocaleString(DateTime.DATETIME_FULL)} - ${DateTime.fromISO(item.end).toLocaleString(DateTime.DATETIME_FULL)}`
                  ) : (
                    `${DateTime.fromISO(item.start).toLocaleString(DateTime.DATE_SHORT)}`
                  )}
                </Text>
              </Box>
            ))}
          </Box>
        )}
        {/* {!invalidResponse && (
          <Button mt={4} colorScheme="green" onClick={onOpen}>Create Calendar Event</Button>
        )}
        {/* Confirmation Modal */}
        {/* <LogoutButton /> */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg={useColorModeValue('white', 'gray.800')}>
            <ModalHeader color={useColorModeValue('blue.600', 'blue.300')}>
              {invalidResponse ? 'Invalid Response' : 'Confirm Calendar Changes'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {invalidResponse ? (
                <Text mb={4}>
                  The response from the API is not valid for calendar updates. Please return to the dashboard.
                </Text>
              ) : (
                <>
                  <Text mb={4}>Are you sure you want to make the following changes to your calendar?</Text>
                  <VStack spacing={4}>
                    {calendarChanges.map((change, index) => (
                      <Box key={index} borderWidth={1} borderRadius="md" p={4} bg={useColorModeValue('white', 'gray.600')} boxShadow="sm">
                        <Text fontWeight="bold" color={useColorModeValue('blue.700', 'blue.400')}>{change.summary}</Text>
                        <Text color={useColorModeValue('gray.600', 'gray.300')}>{change.description}</Text>
                        <Text color={useColorModeValue(change.event_type === 'create' ? 'green.500' : 'red.500', change.event_type === 'create' ? 'green.300' : 'red.300')}>
                          {change.event_type === 'create' ? (
                            `${DateTime.fromISO(change.start).toLocaleString(DateTime.DATETIME_FULL)} - ${DateTime.fromISO(change.end).toLocaleString(DateTime.DATETIME_FULL)}`
                          ) : (
                            `${DateTime.fromISO(change.start).toLocaleString(DateTime.DATE_SHORT)}`
                          )}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              {invalidResponse ? (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Return to Dashboard
                </Button>
              ) : (
                <>
                  <Button colorScheme="blue" mr={3} onClick={createCalendarEvent} isLoading={calendarLoading} loadingText="Processing" size="lg">
                    Yes, Confirm
                  </Button>
                  <Button variant="outline" onClick={onClose} size="lg">
                    No, Cancel
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Container>
  );
};

export default withPageAuthRequired(Dashboard);
