// components/buttons/login-button.js
import { Button } from '@chakra-ui/react';

export const LoginButton = () => {
  return (
    <Button
      as="a"
      href="/api/auth/login"
      size="lg"
      colorScheme="teal"
      variant="solid"
      _hover={{ bg: 'teal.500', color: 'white' }}
    >
      Log In
    </Button>
  );
};
