// pages/dashboard.js
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
  Spinner,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { LoginButton } from '@/components/buttons/login-button';
import NavBar from '../components/NavBar';
import { withPageAuthRequired, useUser } from '@auth0/nextjs-auth0/client';
import { LogoutButton } from '@/components/buttons/logout-button';
const Dashboard = () => {
  const { user, error, isLoading } = useUser();
  const [text, setText] = useState('');
  const [apiResponse, setApiResponse] = useState([]);
  const [calendarChanges, setCalendarChanges] = useState([]);
  const [invalidResponse, setInvalidResponse] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        setCalendarChanges([]); // Clear calendar changes if the response is invalid
      } else {
        setApiResponse(data.content || []); // Set response data
        setCalendarChanges(data.content || []); // Prepare for confirmation
        setInvalidResponse(false);
      }

      onOpen(); // Open the modal
    } catch (error) {
      console.error(error);
      setApiResponse(['Error fetching data from Google Gemini API: ' + error.message]);
      setInvalidResponse(false);
      onOpen(); // Open the modal even if there's an error
    }
  };
  

  const createCalendarEvent = async () => {
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

      onClose(); // Close the modal after successful creation
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error processing events',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) return <Flex justify="center" align="center" height="100vh"><Spinner size="xl" /></Flex>;
  if (error) return <Text color="red.500">{error.message}</Text>;

  return (
    <Container maxW="container.lg" centerContent py={8}>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Basic dashboard using Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <Box w="full" p={4} borderWidth={1} borderRadius="lg">
        <Heading mb={4} textAlign="center">Dashboard</Heading>
        <Text mb={4} textAlign="center">Welcome to your dashboard, {user.name}, {user.email}.</Text>

        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter some text"
          />
          <Button type="submit" colorScheme="blue">Submit</Button>
        </VStack>

        {Array.isArray(apiResponse) && apiResponse.length > 0 && !invalidResponse && (
          <Text mt={4}>
            Response from Google Gemini:
            {apiResponse.map((item, index) => (
              <Box key={index} borderWidth={1} borderRadius="md" p={4} mb={2}>
                <Text fontWeight="bold">{item.summary}</Text>
                <Text>{item.description}</Text>
                <Text>{item.start} - {item.end}</Text>
                <Text color={item.event_type === 'create' ? 'green.500' : 'red.500'}>
                  {item.event_type}
                </Text>
              </Box>
            ))}
          </Text>
        )}

        {!invalidResponse && (
          <Button mt={4} colorScheme="green" onClick={onOpen}>Create Calendar Event</Button>
        )}
        <LogoutButton />
        
        {/* Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
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
                      <Box key={index} borderWidth={1} borderRadius="md" p={4}>
                        <Text fontWeight="bold">{change.summary}</Text>
                        <Text>{change.description}</Text>
                        <Text>{change.start} - {change.end}</Text>
                        <Text color={change.event_type === 'create' ? 'green.500' : 'red.500'}>
                          {change.event_type}
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
                  <Button colorScheme="blue" mr={3} onClick={createCalendarEvent}>
                    Yes, Confirm
                  </Button>
                  <Button variant="outline" onClick={onClose}>
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
