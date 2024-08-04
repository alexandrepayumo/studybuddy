import { useState, useEffect } from 'react';
import { Button, Box, Text, VStack, HStack } from '@chakra-ui/react';

const PomodoroTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (isBreak) {
              setMinutes(25);
              setIsBreak(false);
            } else {
              setMinutes(5);
              setIsBreak(true);
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, isBreak]);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
  };

  return (
    <Box
      className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-blue-600"
      p={4}
    >
      <Text
        className="text-6xl mb-8 text-white font-bold"
        fontSize="6xl"
        textAlign="center"
      >
        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </Text>
      <HStack spacing={4}>
        <Button
          onClick={() => setIsActive(!isActive)}
          colorScheme={isActive ? 'orange' : 'green'}
          size="lg"
          className="px-4 py-2 text-white rounded"
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={resetTimer}
          colorScheme="red"
          size="lg"
          className="px-4 py-2 text-white rounded"
        >
          Reset
        </Button>
      </HStack>
      <VStack mt={8} className="text-white">
        <Text fontSize="xl" className="font-semibold">
          {isBreak ? 'Break Time!' : 'Focus Time'}
        </Text>
      </VStack>
    </Box>
  );
};

export default PomodoroTimer;
