import React from "react";
import { GetServerSideProps } from "next";

// Admin interface page for Payload CMS
export default function AdminPage() {
  return (
    <div>
      <h1>Payload CMS Admin</h1>
      <p>Loading admin interface...</p>
    </div>
  );
}

// Redirect to the actual admin interface
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/api/admin",
      permanent: false,
    },
  };
};
