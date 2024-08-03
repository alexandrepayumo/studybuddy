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
} from '@chakra-ui/react';
import NavBar from '../components/NavBar';
import { withPageAuthRequired, useUser } from '@auth0/nextjs-auth0/client';

const Dashboard = () => {
  const { user, error, isLoading } = useUser();
  const [text, setText] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const toast = useToast();

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
      setApiResponse(data.content);
    } catch (error) {
      console.error(error);
      setApiResponse('Error fetching data from Google Gemini API: ' + error.message);
    }
  };

  const createCalendarEvent = async () => {
    try {
      const response = await fetch('/api/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      const data = await response.json();
      toast({
        title: 'Event created',
        description: `Event created: ${data.eventLink}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error creating event',
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
        <Text mb={4} textAlign="center">Welcome to your dashboard, {user.name}.</Text>

        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter some text"
          />
          <Button type="submit" colorScheme="blue">Submit</Button>
        </VStack>

        {apiResponse !== null && (
          <Text mt={4}>Response from Google Gemini: {apiResponse}</Text>
        )}

        <Button mt={4} colorScheme="green" onClick={createCalendarEvent}>Create Calendar Event</Button>
      </Box>
    </Container>
  );
};

export default withPageAuthRequired(Dashboard);
