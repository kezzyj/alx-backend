import redis from 'redis';

// this creates a new client
const client = redis.createClient(); 
// By default redis.createClient() will use 127.0.0.1 and port 6379

// listen for the connect event to see whether we successfully connected to the redis-server
client.on('connect', () => console.log('Redis client connected to the server'));

// listen for the error event tocheck if we failed to connect to the redis-server
client.on('error', (err) => console.error(`Redis client not connected to the server: ${err.message}`));

// Define the setNewSchool function
function setNewSchool(schoolName, value) {
  // Set the value for the key schoolName
  client.set(schoolName, value, redis.print);
}

// Define the displaySchoolValue function
function displaySchoolValue(schoolName) {
  // Get the value for the key schoolName
  client.get(schoolName, (err, reply) => {
    // Check for errors
    if (err) {
      console.error(err);
    } else {
      // Log the value to the console
      console.log(`${reply}`);
    }
  });
}

// Call the functions
displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
