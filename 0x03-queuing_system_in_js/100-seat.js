// Import the required modules
const redis = require("redis");
const { promisify } = require("util");
const kue = require("kue");
const express = require("express");

// Create a Redic client
const client = redis.createClient();

// Promisify the get and set methods of the client
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Create a function reserveSeat that will take into argument number, and set the key available_seats with the number
async function reserveSeat(number) {
  try {
    // Set the key available_seats with the number
    await setAsync("numberOfAvailableSeats", number);
    // Log the success message
    console.log(`Reserved ${number} seats`);
  } catch (error) {
    // Log the error message
    console.error(error);
  }
}

// Create a function getCurrentAvailableSeats that will return the current number of available seats
async function getCurrentAvailableSeats() {
  try {
    // Get the value of the key available_seats
    const seats = await getAsync("numberOfAvailableSeats");
    // Return the number of seats
    return seats;
  } catch (error) {
    // Log the error message
    console.error(error);
  }
}

// When launching the application, set the number of available seats to 50
reserveSeat(50);

// Initialize the boolean reservationEnabled to true
let reservationEnabled = true;

// Create a Kue queue
const queue = kue.createQueue();

// Server
// Create an express server listening on the port 1245
const app = express();
const port = 1245;

// Add the route GET /available_seats that returns the number of seat available
app.get("/available_seats", async (req, res) => {
  try {
    // Get the current number of available seats
    const seats = await getCurrentAvailableSeats();
    // Send the response with the number of seats
    res.send(`numberOfAvailableSeats ${seats}`);
  } catch (error) {
    // Send the error message
    res.status(500).send(error.message);
  }
});

// Add the route GET /reserve_seat that:
app.get("/reserve_seat", async (req, res) => {
  try {
    // Returns { "status": "Reservation are blocked" } if reservationEnabled is false
    if (!reservationEnabled) {
      res.send({ status: "Reservation are blocked" });
      return;
    }

    // Creates and queues a job in the queue reserve_seat
    const job = queue.create("reserve_seat", {});

    // Save the job and return:
    job.save((error) => {
      if (error) {
        // { "status": "Reservation failed" } if error
        res.send({ status: "Reservation failed" });
      } else {
        // { "status": "Reservation in process" } if no error
        res.send({ status: "Reservation in process" });
      }
    });

    // When the job is completed, print in the console: Seat reservation job JOB_ID completed
    job.on("complete", () => {
      console.log(`Seat reservation job ${job.id} completed`);
    });

    // When the job failed, print in the console: Seat reservation job JOB_ID failed: ERROR_MESSAGE
    job.on("failed", (error) => {
      console.log(`Seat reservation job ${job.id} failed: ${error.message}`);
    });
  } catch (error) {
    // Send the error message
    res.status(500).send(error.message);
  }
});

// Add the route GET /process that:
app.get("/process", async (req, res) => {
  try {
    // Returns { "status": "Queue processing" } just after:
    res.send({ status: "Queue processing" });

    // Process the queue reserve_seat (async)
    queue.process("reserve_seat", async (job, done) => {
      try {
        // Decrease the number of seat available by using getCurrentAvailableSeats and reserveSeat
        const seats = await getCurrentAvailableSeats();
        const newSeats = seats - 1;
        await reserveSeat(newSeats);

        // If the new number of available seats is equal to 0, set reservationEnabled to false
        if (newSeats === 0) {
          reservationEnabled = false;
        }

        // If the new number of available seats is more or equal than 0, the job is successful
        if (newSeats >= 0) {
          done();
        } else {
          // Otherwise, fail the job with an Error with the message Not enough seats available
          done(new Error("Not enough seats available"));
        }
      } catch (error) {
        // Fail the job with the error
        done(error);
      }
    });
  } catch (error) {
    // Send the error message
    res.status(500).send(error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
