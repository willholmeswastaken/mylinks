# Design Decisions

## The overall architecture:
- **App:** NextJs app (Typescript, React, Prisma)
- **AWS Lambda** - User Profile Link Visit logging (Go)
- **AWS Lambda** - User Profile Visit logging (Go)
- **AWS SQS Queue** - User Profile Visit Queue
- **AWS SQS Queue** - User Profile Link Visit Queue
- **Planetscale MySql database**

### Why did I decide to go for a queue -> lambda architecture?
To the outsider, this seems really overkill. At the end of the day all we are doing is queueing a message saying for this id here is it's metadata (device info etc) from the next app. Then the lambda will process this and add the visit to the database.

There are a few reasons for doing it this way:
1. I wanted to learn and play about with Go, and there is no better way than building something in a language you want to learn.
2. Planetscale is a serverless MySQL db. This means I face the issue of cold start times, which means that users requesting to view someones profile might take a longer time than hoped for. Therefore to reduce any further burden on the request duration, I decided to move the registering of a new visit from the inline page request to a queue -> lambda mechanism. Hopefully this means as we scale we will notice a marginal difference vs doing everything inline.
3. I wanted to use AWS as it is my favourite cloud provider and gives me a lot of free stuff.

## Link page profile visit flow
```mermaid
sequenceDiagram
    participant UserProfilePage
    participant GetServerSideProps
    participant UserProfileVisitQueue
    participant PlanetScaleDb
    UserProfilePage->>GetServerSideProps: Request user profile page
    GetServerSideProps->>UserProfileVisitQueue: Queue a visit log message
    UserProfileVisitQueue-->>GetServerSideProps: Queued up!
    GetServerSideProps->>PlanetScaleDb: User profile db query
    PlanetScaleDb-->>GetServerSideProps: User profile db query response
    GetServerSideProps-->>UserProfilePage: User profile page response
```

## User profile visit lambda flow
```mermaid
sequenceDiagram
    participant UserProfileVisitQueue
    participant UserProfileVisitQueueHandler
    participant UserProfileVisitDb
    UserProfileVisitQueue->>UserProfileVisitQueueHandler: Send message to handler
    UserProfileVisitQueueHandler->>UserProfileVisitDb: Add a visit to the user profile in the database
    UserProfileVisitDb-->>UserProfileVisitQueueHandler: Added!
    UserProfileVisitQueueHandler-->>UserProfileVisitQueue: Done.
```

## Link page profile link visit flow
```mermaid
sequenceDiagram
    participant UserProfilePage
    participant VisitLinkApi
    participant UserProfileLinkVisitQueue
    participant UserProfileLinkVisitDb
    UserProfilePage->>VisitLinkApi: Link clicked
    VisitLinkApi->>UserProfileLinkVisitQueue: Queue a visit log message
    UserProfileLinkVisitQueue-->>VisitLinkApi: Queued up!
    VisitLinkApi->>UserProfileLinkVisitDb: User profile link db query
    UserProfileLinkVisitDb-->>VisitLinkApi: User profile link db query response
    VisitLinkApi-->>UserProfilePage: Return redirect to link
```

## User profile link visit lambda flow
```mermaid
sequenceDiagram
    participant UserProfileLinkVisitQueue
    participant UserProfileLinkVisitQueueHandler
    participant UserProfileLinkVisitDb
    UserProfileLinkVisitQueue->>UserProfileLinkVisitQueueHandler: Send message to handler
    UserProfileLinkVisitQueueHandler->>UserProfileLinkVisitDb: Add a visit to the user profile link in the database
    UserProfileLinkVisitDb-->>UserProfileLinkVisitQueueHandler: Added!
    UserProfileLinkVisitQueueHandler-->>UserProfileLinkVisitQueue: Done.
```