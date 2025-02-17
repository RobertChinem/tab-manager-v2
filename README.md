# Tab Manager
A tab manager extension for Chrome.

## How to Create New Features

### Step 1
Create a class inside `src/custom-procedures` that extends `CustomProcedure` (`src/shared/types/custom-procedure.ts`).

### Step 2
Add the newly created class to the return value of `getCustomProcedures` (`src/custom-procedures/index.ts`).

### Step 3
Run `npm run build` to compile the extension.

### Step 4
Load the extension (`dist`) in Chrome.
