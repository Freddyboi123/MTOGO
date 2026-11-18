# Team policies

These policies describe how we work. They are explicit so that every team member, and any new one, can follow them.

| Policy | Guiding question | Our answer |
| --- | --- | --- |
| Workflow | When can an issue move between workflow stages? | See Workflow below |
| WIP | How are WIP limits and blocked work handled? | See WIP below |
| Definition of Done | When is a feature considered complete? | See Definition of Done below |
| Quality | Which automated checks must pass? | See Quality below |
| Collaboration | How are pull requests, code reviews and integration handled? | See Collaboration below |

## Workflow

Issues move through Backlog, Ready, In Progress and Done on the Kanban board.

- Backlog to Ready: the issue is understandable, delimited and has acceptance criteria
- Ready to In Progress: there is free WIP capacity, a team member takes the issue, and the Started date is registered
- In Progress to Done: the Definition of Done is met, the pull request is merged and the issue is closed as completed

Not every issue is a user story. Technical work is tracked as tech stories.

## WIP

- Each person works on one issue at a time, so at most four issues are in progress at once
- If you take an issue, you finish it within a reasonable time. Otherwise it is released so it does not block others
- We finish what is started before we start something new
- Old or blocked issues are discussed at the weekly flow review

## Definition of Done

The Definition of Done is maintained in this repository. An issue may only be moved to Done when all its criteria are met.

## Quality

- The CI pipeline builds and tests the backend on every pull request and every push to review and main
- A failing build or failing tests must be fixed before a pull request is merged
- Code follows the team code standards, which are maintained in this repository

### Test coverage

- CI measures backend test coverage with JaCoCo and shows a summary on every run. The full report is uploaded as the build artifact backend-reports
- The build fails if line coverage of the backend is below the required minimum
- The required minimum is 25% line coverage. It is set just below the coverage we had when the requirement was introduced (28.7%), so coverage can not fall
- We raise the minimum as tests are added. The minimum is reviewed at the weekly flow review and is never lowered. It is set by `coverage.line.minimum` in `Backend/pom.xml`

### Static analysis

- CI runs SpotBugs on the backend and shows the findings in the summary of every run
- The build fails on high priority findings. Lower priority findings are reported but do not fail the build
- Known findings that we accept for now are listed in `Backend/spotbugs-exclude.xml` with a reason. New findings are fixed, not excluded, unless the team agrees otherwise in the review

## Collaboration

- We never work directly on main. Branches are short lived, created from review and merged back into review through a pull request
- Every pull request is reviewed by another team member, as soon as possible so that work does not wait
- main must always be stable and ready to deploy
- Releases follow Semantic Versioning
- Documentation is written in English

## Flow measurements

- Cycle time is the time from In Progress to Done, measured as Closed minus Started, on issues and sub issues
- Lead time is measured on user stories, from the start of development until they are visible in production
- Throughput is the number of finished issues and sub issues per week. Parent issues are not counted, to avoid counting the same work twice
- WIP is the number of issues in progress

## Weekly flow review

Once a week the team spends about 15 minutes on four questions:

1. How many issues did we finish last week?
2. What is the cycle time of the issues we finished?
3. Which issues in progress are old or blocked?
4. Which concrete change do we try next week?

Observations, decisions and experiments are noted briefly in this repository.
