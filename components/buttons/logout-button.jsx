// components/buttons/logout-button.js
import { Button } from '@chakra-ui/react';

 export const LogoutButton = () => {
  return (
    <Button
      as="a"
      href="/api/auth/logout"
      size="lg"
      colorScheme="teal"
      variant="solid"
      _hover={{ bg: 'teal.500', color: 'white' }}
    >
      Log Out
    </Button>
  );
};
