# Margaret Flower App

A Next.js application connected to Supabase that displays a searchable list of flowers native to the NOVA region. Clicking on a flower opens a popup with detailed information and icons for bloom time, categories, deer resistance, sunlight, moisture, soil type, and more.

## Features

- **Searchable flower list** with responsive design.
- **Popup detail view** for each flower, including:
  - Latin and common names
  - Photo from Supabase storage
  - Bloom time, category, deer resistance, sunlight, moisture, soil type, height, and wildlife information
  - Gardening tips and design function text
- **Supabase integration** for both data and image storage.
- **Admin page** (in progress) for adding and editing flower records.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) with TypeScript
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Storage)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended) or local dev server

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>