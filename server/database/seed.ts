import { LocationData } from "@advanced-react/shared/schema/experience";
import { faker } from "@faker-js/faker";

import { auth } from "../features/auth";
import { env } from "../utils/env";
import {
  commentLikesTable,
  commentsTable,
  experienceAttendeesTable,
  experiencesTable,
  experienceTagsTable,
  notificationsTable,
  tagsTable,
  userFollowsTable,
  usersTable,
} from "./schema";

import { db } from ".";

async function seed() {
  // Create demo user
  const [demoUser] = await db
    .insert(usersTable)
    .values({
      name: "Cosden Solutions",
      bio: "Cosden Solutions is a company that teaches people how to code in React.",
      email: "demo@cosdensolutions.io",
      password: await auth.hashPassword("cosdensolutions"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();

  // Create some tags
  const tagNames = [
    "Hiking",
    "Running",
    "Biking",
    "Swimming",
    "Yoga",
    "Dinner",
    "Movie",
    "Concert",
    "Party",
    "Game Night",
    "Book Club",
    "Art Class",
    "Cooking Class",
    "Wine Tasting",
  ];

  const tags = tagNames.map((name) => ({
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const insertedTags = await db.insert(tagsTable).values(tags).returning();

  // Creates some locations
  const locations: LocationData[] = [
    {
      displayName:
        "HIDE, 85 - 87, Piccadilly, St. James's, Mayfair, London, Greater London, England, W1J 7NB, United Kingdom",
      lat: 51.5061753,
      lon: -0.1443366,
    },
    {
      displayName:
        "Fallow, 52, Haymarket, Seven Dials, Bloomsbury, City of Westminster, Greater London, England, SW1Y 4RP, United Kingdom",
      lat: 51.5094184,
      lon: -0.1327361,
    },
    {
      displayName:
        "The Ledbury, 127, Ledbury Road, Westbourne Green, Maida Hill, Royal Borough of Kensington and Chelsea, London, Greater London, England, W11 2AQ, United Kingdom",
      lat: 51.5166794,
      lon: -0.2000637,
    },
    {
      displayName:
        "Ave Mario, Henrietta Street, Covent Garden, Bloomsbury, City of Westminster, Greater London, England, WC2E 8QH, United Kingdom",
      lat: 51.5108935,
      lon: -0.1238784,
    },
    {
      displayName:
        "Pink Mamma, 20b, Rue de Douai, Quartier Saint-Georges, 9th Arrondissement, Paris, Ile-de-France, Metropolitan France, 75009, France",
      lat: 48.8819128,
      lon: 2.3344849,
    },
    {
      displayName:
        "le Ju, 16, Rue des Archives, Quartier Saint-Gervais, 4th Arrondissement, Paris, Ile-de-France, Metropolitan France, 75004, France",
      lat: 48.8577054,
      lon: 2.3547735,
    },
    {
      displayName:
        "Chez Loulou, Rue Rambuteau, Quartier Saint-Merri, 4th Arrondissement, Paris, Ile-de-France, Metropolitan France, 75004, France",
      lat: 48.8616342,
      lon: 2.3513346,
    },
    {
      displayName:
        "Epicure, Rue du Faubourg Saint-Honoré, Quartier de la Madeleine, 8th Arrondissement of Paris, Paris, Ile-de-France, Metropolitan France, 75008, France",
      lat: 48.8717179,
      lon: 2.3148011,
    },
  ];

  // Create other users and experiences
  for (let i = 0; i < 100; i++) {
    // Creates fake user
    const users = await db
      .insert(usersTable)
      .values({
        name: faker.person.firstName(),
        bio: faker.person.bio(),
        avatarUrl: faker.image.avatar(),
        email: faker.internet.email(),
        password: await auth.hashPassword(faker.internet.password()),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const postUser = users[0];

    // 5% chance this experience will be attributed to the demo user
    const experienceUserId = Math.random() < 0.05 ? demoUser.id : postUser.id;

    // Add random location to each experience
    const randomLocation =
      locations[Math.floor(Math.random() * locations.length)];

    const [experience] = await db
      .insert(experiencesTable)
      .values({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        scheduledAt: faker.date.soon().toISOString(),
        url: faker.internet.url(),
        imageUrl: `${env.SERVER_BASE_URL}/uploads/image-${Math.floor(Math.random() * 10) + 1}.jpg`,
        location: JSON.stringify(randomLocation),
        userId: experienceUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    // Add 1-4 random tags to each experience
    const numberOfTags = Math.floor(Math.random() * 4) + 1;
    const shuffledTags = [...insertedTags].sort(() => Math.random() - 0.5);

    for (let j = 0; j < numberOfTags && j < shuffledTags.length; j++) {
      const tag = shuffledTags[j];

      try {
        await db.insert(experienceTagsTable).values({
          experienceId: experience.id,
          tagId: tag.id,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Ignore duplicate tags
        continue;
      }
    }
  }

  // Add random attendees to experiences and create notifications
  const users = await db.query.usersTable.findMany();
  const experiences = await db.query.experiencesTable.findMany();

  for (const experience of experiences) {
    // Each experience will have between 0 and 20 random attendees
    const numberOfAttendees = Math.floor(Math.random() * 21);
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numberOfAttendees && i < shuffledUsers.length; i++) {
      const attendee = shuffledUsers[i];

      // Don't attend your own experience
      if (attendee.id === experience.userId) {
        continue;
      }

      try {
        const [attendeeRecord] = await db
          .insert(experienceAttendeesTable)
          .values({
            experienceId: experience.id,
            userId: attendee.id,
            createdAt: faker.date
              .between({
                from: experience.createdAt,
                to: new Date(),
              })
              .toISOString(),
          })
          .returning();

        // Create notification for the experience owner
        await db.insert(notificationsTable).values({
          type: "user_attending_experience",
          experienceId: experience.id,
          fromUserId: attendee.id,
          userId: experience.userId,
          createdAt: attendeeRecord.createdAt,
        });
      } catch {
        // Ignore duplicate attendees
        continue;
      }
    }
  }

  // Add some sample comments and create notifications
  for (let experienceId = 1; experienceId <= 10; experienceId++) {
    for (let i = 0; i < 3; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const [comment] = await db
        .insert(commentsTable)
        .values({
          experienceId,
          content:
            Math.random() > 0.5
              ? faker.lorem.paragraph()
              : faker.lorem.sentence(),
          userId: randomUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      // Get the experience owner
      const experience = experiences.find((e) => e.id === experienceId);
      if (experience) {
        // Create notification for the experience owner
        await db.insert(notificationsTable).values({
          type: "user_commented_experience",
          experienceId,
          commentId: comment.id,
          fromUserId: randomUser.id,
          userId: experience.userId,
          createdAt: comment.createdAt,
        });

        // Add random likes to the comment
        const numberOfLikes = Math.floor(Math.random() * 6); // 0-5 likes per comment
        const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

        for (let j = 0; j < numberOfLikes && j < shuffledUsers.length; j++) {
          const liker = shuffledUsers[j];

          // Don't like your own comment
          if (liker.id === randomUser.id) {
            continue;
          }

          try {
            await db.insert(commentLikesTable).values({
              commentId: comment.id,
              userId: liker.id,
              createdAt: faker.date
                .between({
                  from: comment.createdAt,
                  to: new Date(),
                })
                .toISOString(),
            });
          } catch {
            // Ignore duplicate likes
            continue;
          }
        }
      }
    }
  }

  // Add random follows between users
  // Each user will follow between 5-15 random users
  for (const user of users) {
    const numberOfFollows = Math.floor(Math.random() * 11) + 5; // Random number between 5-15
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numberOfFollows && i < shuffledUsers.length; i++) {
      const userToFollow = shuffledUsers[i];

      // Don't follow yourself
      if (userToFollow.id === user.id) {
        continue;
      }

      try {
        await db.insert(userFollowsTable).values({
          followerId: user.id,
          followingId: userToFollow.id,
          createdAt: faker.date
            .between({
              from: user.createdAt,
              to: new Date(),
            })
            .toISOString(),
        });

        // Create notification for the user being followed
        await db.insert(notificationsTable).values({
          type: "user_followed_user",
          fromUserId: user.id,
          userId: userToFollow.id,
          createdAt: new Date().toISOString(),
        });
      } catch {
        // Ignore duplicate follows
        continue;
      }
    }
  }
}

seed();
