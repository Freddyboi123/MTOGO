# Team policies

These policies describe how we work. They are explicit so that every team member, and any new one, can follow them.

| Policy | Guiding question | Our answer |
| --- | --- | --- |
| Workflow | When can an issue move between workflow stages? | See Workflow below |
| WIP | How are WIP limits and blocked work handled? | See WIP below |
| Feature driven work | How is work split and when is a feature finished? | See Feature driven work below |
| Definition of Done | When is a feature considered complete? | See Definition of Done below |
| Quality | Which automated checks must pass? | See Quality below |
| Collaboration | How are pull requests, code reviews and integration handled? | See Collaboration below |

## Workflow

Issues move through Backlog, Ready, In Progress, In Review and Done on the Kanban board.

- Backlog to Ready: the issue is understandable, delimited and has acceptance criteria
- Ready to In Progress: there is free WIP capacity, a team member takes the issue, and the Started date is registered
- In Progress to In Review: the work is finished and a pull request is opened
- In Review to Done: the Definition of Done is met, the pull request is merged and the issue is closed as completed

Not every issue is a user story. Technical work is tracked as tech stories.

## WIP

- Each person works on one issue at a time, so at most four issues are in progress at once
- If you take an issue, you finish it within a reasonable time. Otherwise it is released so it does not block others
- At most two user stories are in progress at once
- We finish what is started before we start something new
- Old or blocked issues are discussed at the weekly flow review

## Feature driven work

- Work is organised as epics, user stories and tasks. An epic is a feature, its user stories are sub issues of the epic, and tasks are sub issues of a user story
- A user story is cut so it can be finished from database to screen and put in production within a few days
- We build the features in the order of the backlog and finish a feature before we start the next one
- A feature is done when all its user stories are done and the feature is in production
- Unfinished work can be merged and deployed behind a feature flag. The flag is turned off in production until the whole feature is done
- Feature flags live in `Backend/src/main/resources/feature-flags.properties`, with a comment that says which user stories each flag belongs to. An environment variable with the same name overrides a flag on the server without a new deploy
- The frontend reads the flags from `GET /api/features`, so a flag is only defined in one place

## Definition of Done

The Definition of Done is maintained in this repository. An issue may only be moved to Done when all its criteria are met.

## Quality

- The CI pipeline builds and tests the backend on every pull request and every push to main
- A failing build or failing tests must be fixed before a pull request is merged
- Code follows the team code standards, which are maintained in this repository

### Test coverage

- CI measures backend test coverage with JaCoCo and shows a summary on every run. The full report is uploaded as the build artifact backend-reports
- The build fails if line coverage of the backend is below the required minimum
- The required minimum is 60% line coverage. It was introduced at 25%, just below the coverage at that time (28.7%), and raised to 60% on 25 November 2026 when the coverage was 66.4%, so coverage can not fall
- We raise the minimum as tests are added. The minimum is reviewed at the weekly flow review and is never lowered. It is set by `coverage.line.minimum` in `Backend/pom.xml`

### Static analysis

- CI runs SpotBugs on the backend and shows the findings in the summary of every run
- The build fails on high priority findings. Lower priority findings are reported but do not fail the build
- Known findings that we accept for now are listed in `Backend/spotbugs-exclude.xml` with a reason. New findings are fixed, not excluded, unless the team agrees otherwise in the review

## Collaboration

- We never work directly on main. Branches are short lived, created from main and merged back into main through a pull request
- A new branch is created from the newest main, so main is pulled first
- Before a pull request is merged, main is merged into the branch and the tests are run again, because main requires branches to be up to date
- Pull requests are not based on other unmerged branches. If work depends on an unmerged branch, that branch is merged first
- Every pull request is reviewed by another team member, as soon as possible so that work does not wait
- main must always be stable and ready to deploy
- Releases follow Semantic Versioning. A new minor version is tagged when a feature is turned on in production
- Documentation is written in English

## Flow measurements

- Cycle time is the time from In Progress to Done, measured as Closed minus Started, on issues and sub issues
- Lead time is measured on user stories, from when the first sub issue is started until the story is visible in production
- Throughput is the number of finished issues and sub issues per week. Parent issues, such as epics, are not counted, to avoid counting the same work twice
- WIP is the number of issues in progress

## Weekly flow review

Once a week the team spends about 15 minutes on four questions:

1. How many issues did we finish last week?
2. What is the cycle time of the issues we finished?
3. Which issues in progress are old or blocked?
4. Which concrete change do we try next week?

Observations, decisions and experiments are noted briefly in this repository.
