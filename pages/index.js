import Head from 'next/head';
import { Box, Container, Heading, Image, Text, VStack, HStack, Flex, Icon, useBreakpointValue } from '@chakra-ui/react';
import { LoginButton } from '@/components/buttons/login-button';
import { FaNodeJs, FaGoogle, FaCalendarAlt } from 'react-icons/fa'; // Import icons directly from react-icons
import { SiNextdotjs } from 'react-icons/si';
// import googleCalendarImage from '/google-calendar.png'; // Ensure the path is correct

const technologies = [
  { name: 'Next.js', icon: SiNextdotjs },
  { name: 'Auth0', icon: FaGoogle },
  { name: 'Google Gemini', icon: FaNodeJs },
  { name: 'Google Calendar', icon: FaCalendarAlt },
];

export default function Home() {
  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' });

  return (
    <Container maxW="container.xl" centerContent py={8}>
      <Head>
        <title>Landing Page</title>
        <meta name="description" content="Basic landing page using Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <VStack spacing={16} align="center">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            Welcome to Our Study Buddy Application
          </Heading>
          <Text fontSize="xl" mb={8}>
            Our application automatically adds tasks to your Google Calendar, helping you stay organized and on track.
          </Text>
          <LoginButton />
          <HStack spacing={8} mt={8} align="center" justify="center">
            {technologies.map((tech) => (
              <HStack key={tech.name} spacing={2} align="center">
                <Icon as={tech.icon} boxSize={8} />
                <Text fontSize="lg">{tech.name}</Text>
              </HStack>
            ))}
          </HStack>
        </Box>

        <Flex
          direction={flexDirection}
          align="center"
          justify="center"
          w="full"
          maxW="container.md"
          py={8}
          borderTopWidth={1}
          borderTopColor="gray.200"
        >
          <Image
            src='/google-calender.png'
            alt="Google Calendar with meeting events"
            borderRadius="md"
            boxShadow="md"
          />
          <Box ml={{ base: 0, md: 8 }} textAlign={{ base: 'center', md: 'left' }}>
            <Heading as="h2" size="lg" mb={4}>
              What We Do
            </Heading>
            <Text fontSize="lg">
              Our study buddy application helps you manage your study schedule efficiently. It automatically creates and updates events in your Google Calendar based on your tasks, ensuring that you never miss a deadline.
            </Text>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
}
