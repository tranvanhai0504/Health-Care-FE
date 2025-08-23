# Health Care Application

A modern, feature-rich web application designed to streamline operations for a healthcare clinic. This platform caters to different user roles including Admins, Doctors, and Receptionists, providing each with a tailored dashboard and functionalities to manage their tasks efficiently.

## ✨ Features

-   **Role-Based Access Control:** Separate dashboards and features for Admins, Doctors, and Receptionists.
-   **Authentication:** Secure user sign-up and login functionality.
-   **Appointment Scheduling:**
    -   Receptionists can book and manage appointments for doctors.
    -   Doctors can view their schedules and upcoming appointments.
-   **Medical Examinations:**
    -   Doctors can manage patient consultations, including symptoms, diagnoses, and subclinical results.
    -   Real-time updates for medical records.
-   **Patient Management:** Centralized system for managing patient information.
-   **Service & Package Management:** Admins can define and manage consultation services and packages.
-   **Real-time Chat:** Secure communication channel between doctors and patients.
-   **Blog Management:** Admins can create and manage blog posts for the platform.

## 🚀 Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
-   **API Communication:** [Axios](https://axios-http.com/)
-   **Linting/Formatting:** ESLint & Prettier

## 📂 Project Structure

The project follows the Next.js App Router paradigm, organizing features by user roles and domains.

```
src
├── app
│   ├── (admin)         # Routes and UI for Admin role
│   ├── (auth)          # Authentication routes (Login, Signup)
│   ├── (dashboard)     # General dashboard layout
│   ├── (doctor)        # Routes and UI for Doctor role
│   ├── (receptionist)  # Routes and UI for Receptionist role
│   └── ...
├── components
│   ├── ui              # Reusable UI components from shadcn/ui
│   ├── admin           # Components specific to Admin features
│   ├── doctor          # Components specific to Doctor features
│   └── ...
├── hooks               # Custom React hooks
├── lib                 # Library functions, utilities (e.g., axios instance)
├── providers           # React Context providers (e.g., AuthProvider)
├── schemas             # Zod schemas for form validation
├── services            # API service layers for different modules
├── stores              # Zustand store definitions
└── types               # TypeScript type definitions
```

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18.x or later)
-   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url.com/
    cd health-care-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables (e.g., API base URL).
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.