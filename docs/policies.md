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

Static analysis and code coverage are planned additions to the pipeline.

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
