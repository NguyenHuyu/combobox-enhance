import { Form } from "@/components/Form";

export default function Home() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Flexible Combobox Demo</h1>
      <p className="text-gray-500 mb-8">
        Demonstrating how to use the ApiFlexibleCombobox with different data
        fetching functions for create and update forms.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4">Update Form</h2>
          <p className="text-sm text-gray-500 mb-4">
            This form loads an existing item and uses a different data fetching
            function.
          </p>
          {/* <Form itemId={40} /> */} {/* string | number*/}
          <Form itemId={"40"} />
        </div>
      </div>
    </div>
  );
}
