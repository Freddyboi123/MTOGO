# Code Standards

## 1. Architecture and structure

- The code must follow the architecture of the project throughout the development process.
- Existing design patterns and project structures must be reused instead of introducing unnecessary alternative solutions.
- New classes and functions must be placed in the relevant packages and layers.
- We use Separation of Concerns to ensure that each component has a clear and limited area of responsibility.
  - DAO: handles communication with the database and persistence of data.
  - DTO: used to transfer data between the layers of the system and external clients.
  - Mappers: responsible for conversion between, for example, Entities and DTOs.
  - Controllers: handle incoming HTTP requests, call the relevant services and return HTTP responses.
  - Services: contain the business logic of the system and handle processes between the layers.
  - Entities: represent the data models of the system and their relations to the database.

Flow:

    Client -> Controller -> Service -> DAO -> Persistence -> Mappers <-> DTO -> Controller -> Frontend

## 2. Naming

- Class names must start with a capital letter and follow PascalCase.
  - Example: AdminController
- Variables must start with a lowercase letter and follow camelCase.
  - Example: userName
- Methods must follow camelCase.
  - Example: getUserById()
- Constants are written in uppercase with underscores between the words.
  - Example: MAX_LOGIN_ATTEMPTS
- Names must be descriptive and make sense in relation to their function, so the purpose of each element is clear.

## 3. Code formatting and readability

- Tabs are used for indentation of code inside curly braces ({ }).
- Code must be clear and divided into logical sections.
- There must be appropriate line breaks between methods and logical blocks of code.
- Long and complex methods should be split into smaller methods where it makes sense.
- Unnecessary complexity must be avoided.

## 4. Separators and comments

- Separators can be used to divide larger classes into logical sections.
- The following separator is used as a common convention:

    // ________________________________________________________

- Comments must explain the intention of the code where it is not self-explanatory.
- Unnecessary comments that merely repeat what the code does should be avoided.

## 5. Consistency

- Existing code standards must be followed when new functionality is added.
- The existing style of the project should be followed as far as possible.
- All group members must use the same naming and formatting.
- Code must be easy to read and maintain for the other group members.

## 6. Git, language and secrets

- Branch names follow the pattern type/issue-number-short-description, for example docs/6-workflow-policies.
- Pull requests reference their issue with Refs #N.
- Commit messages are written in English and describe what was changed.
- Code, comments and documentation are written in English.
- Secrets such as passwords and keys, for example SMTP_PASSWORD, are never committed to the repository.

## Shared agreement

All group members are responsible for following these Code Standards. The purpose is to ensure a consistent code base where all group members can understand, develop and maintain each other's code.
