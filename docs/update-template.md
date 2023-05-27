# Update latest changes from template

- `git remote add boilerplate https://github.com/brocoders/nestjs-boilerplate`
- `git fetch boilerplate main`
- check new commit by `git log boilerplate/main` and cherry-pick by `git cherry-pick <commit-hash>`
- or pick all new commit `git merge boilerplate/main --allow-unrelated-histories`
- important: `git remote remove boilerplate`
- don't forget to `npm i` if needed
