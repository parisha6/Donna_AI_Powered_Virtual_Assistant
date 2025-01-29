import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import React from "react";
import axios from "axios";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [listening, setListening] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [enableFileOptions, setEnableFileOptions] = useState(false);
  const fileInputRef = useRef(null); // Add this in your component's top-level

  // // Handle sending a typed message
  // const sendMessage = () => {
  //   const text = input.current.value.trim().toLowerCase(); // Normalize user input
  //   const noteKeywords = ["transcribe", "convert to text"]; // Define note-related keywords

  //   if (!loading && !message) {
  //     // Check if user input contains any note-related keyword
  //     const containsNoteKeyword = noteKeywords.some((keyword) =>
  //       text.includes(keyword)
  //     );

  //     // Update the state based on whether note-related keywords are found
  //     setEnableFileOptions(containsNoteKeyword);

  //     if (containsNoteKeyword) {
  //       chat("Please say that upload your files using the Choose file button.");
  //     } else {
  //       chat(text);
  //     }

  //     input.current.value = ""; // Clear the input field
  //   }
  // };


  // const sendMessage = async () => {

  //   const text = input.current.value.trim().toLowerCase(); // Normalize user input
  //   const noteKeywords = ["transcribe", "convert to text"]; // Define note-related keywords
  //   const kbKeywords = ["knowledge base", "kb"]; // Define knowledge base related keywords

  //   if (!loading && !message) {

  //     if (text.includes("reminder")) {

  //       try {
  //         // Use the current date as the base date
  //         const currentDate = new Date();
  //         let startTime = new Date(currentDate);

  //         // Check if "tomorrow" is mentioned in the text
  //         if (text.toLowerCase().includes("tomorrow")) {
  //           startTime.setDate(startTime.getDate() + 1); // Move to the next day
  //         }

  //         // Check if a specific date is mentioned in the text 
  //         const dateMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s(of\s)?(\w{3,9})(,\s(\d{4}))?/);
  //         if (dateMatch) {
  //           const [_, day, , month, , year = new Date().getFullYear()] = dateMatch; // Default to current year if not specified
  //           startTime = new Date(`${month} ${day}, ${year}`);
  //           console.log(`Parsed Date: ${startTime}`);
  //         } 
  //         // Extract time from the text
  //         const timeMatch = text.match(/(\d{1,2})(:\d{2})?\s?(am|pm|AM|PM|a\.m\.|p\.m\.|A\.M\.|P\.M\.)?/);

  //         if (!timeMatch) {
  //           console.log("No valid time found in the text. Please specify a time.");
  //           return;
  //         }

  //         const [_, hours, minutes = ":00", period] = timeMatch;
  //         let parsedHours = parseInt(hours, 10);


  //         // Handle AM/PM correctly
  //         if (period) {
  //           const normalizedPeriod = period.replace(/\./g, "").toLowerCase(); // Normalize A.M. and P.M. to am/pm
  //           if (normalizedPeriod === "pm" && parsedHours < 12) {
  //             parsedHours += 12; // Convert PM hours to 24-hour format
  //           } else if (normalizedPeriod === "am" && parsedHours === 12) {
  //             parsedHours = 0; // Midnight case
  //           }
  //         }


  //         // Construct start time
  //         startTime.setHours(parsedHours);
  //         startTime.setMinutes(parseInt(minutes.slice(1), 10));
  //         startTime.setSeconds(0);

  //         // Construct end time (15 minutes later)
  //         const endTime = new Date(startTime);
  //         endTime.setMinutes(startTime.getMinutes() + 15);

  //         // Prepare event data
  //         const eventData = {
  //           subject: "Reminder from Donna",
  //           start: startTime.toISOString(),
  //           end: endTime.toISOString(),
  //           timeZone: "Eastern Standard Time",
  //         };

  //         // call the endpoint to create the event
  //         const response = await fetch("https://donna-backend.onrender.com/createEvent", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(eventData),
  //         });

  //         const result = await response.json();
  //         if (result.message == "Event created successfully!") {
  //           chat("Please say that reminder is added successfully.");
  //         } else {
  //           console.log("Please say Sorry, there was an issue setting up the reminder. Please try again.");
  //         }
  //       } catch (error) {
  //         console.error("Error creating event:", error);
  //       }
  //     } else if (text.includes("send an email")) {
  //       try {
  //         // searching for the email provided by the user
  //         const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  //         if (!emailMatch) {
  //           console.log("No valid email address found in the text.");
  //           return;
  //         }
  //         const recipientEmail = emailMatch[0];
  //         const bodyMatch = text.match(/(?:body|message)\s*[:\s]*(.*)/i);
  //         const emailBody = bodyMatch ? bodyMatch[1].trim() : "Email from Donna"; // Default message if no body is found

  //         // Prepare the email Json request data
  //         const emailData = {
  //           recipient: recipientEmail,
  //           subject: "Email from Donna",
  //           body: emailBody,
  //         };

  //         // Call the backend endpoint to send the email
  //         const response = await fetch("https://donna-backend.onrender.com/sendEmail", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(emailData),
  //         });
  //         const result = await response.json();
  //         if (result.message == "Email sent successfully!") {
  //           chat("Please say that Email has been sent successfully.");
  //         } else {
  //           console.log("Please say Sorry, there was an issue sending your email. Please try again.");
  //         }
  //       } catch (error) {
  //         console.error("Error sending email:", error);
  //       }
  //     }

  //     // Check if user input contains any note-related keyword
  //     const containsNoteKeyword = noteKeywords.some((keyword) =>
  //       text.includes(keyword)
  //     );

  //     // Check if user input contains any knowledge base related keyword
  //     const containsKBKeyword = kbKeywords.some((keyword) =>
  //       text.includes(keyword)
  //     );

  //     // Update the state based on whether note-related keywords are found
  //     setEnableFileOptions(containsNoteKeyword);

  //     else if (containsNoteKeyword) {
  //       chat("Please say that upload your files using the Choose file button.");
  //     } else if (containsKBKeyword) 
  //       {
  //       try {
  //         // Call the RAG API
  //         const response = await fetch('https://donna-backend.onrender.com/rag', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //           body: JSON.stringify({message: input.current.value}),
  //         });

  //         const data = await response.text();
  //         console.log(data);
  //         const test="Please say this content:"+data;
  //         chat(test);
  //       } catch (error) {
  //         console.error('Error calling RAG API:', error);
  //       }
  //     } else 
  //     {
  //       chat(text);
  //       console.log(text);
  //     }
  //   }
  //   input.current.value = ""; // Clear the input field

  // };


const sendMessage = async () => {
  const text = input.current.value.trim().toLowerCase(); // Normalize user input
  const noteKeywords = ["transcribe", "convert to text"]; // Define note-related keywords
  const kbKeywords = ["knowledge base", "kb"]; // Define knowledge base-related keywords

  if (!loading && !message) {
    try {
      if (text.includes("reminder")) {
        const currentDate = new Date();
        let startTime = new Date(currentDate);

        if (text.includes("tomorrow")) {
          startTime.setDate(startTime.getDate() + 1);
        }

        const dateMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s(of\s)?(\w{3,9})(,\s(\d{4}))?/);
        if (dateMatch) {
          const [_, day, , month, , year = new Date().getFullYear()] = dateMatch;
          startTime = new Date(`${month} ${day}, ${year}`);
        }

        const timeMatch = text.match(/(\d{1,2})(:\d{2})?\s?(am|pm|a\.m\.\|p\.m\.)?/i);
        if (!timeMatch) {
          console.log("No valid time found in the text. Please specify a time.");
          input.current.value = ""; // Clear the input field
          return;
        }

        let [_, hours, minutes = ":00", period] = timeMatch;
        let parsedHours = parseInt(hours, 10);

        if (period) {
          const normalizedPeriod = period.replace(/\./g, "").toLowerCase();
          if (normalizedPeriod === "pm" && parsedHours < 12) {
            parsedHours += 12;
          } else if (normalizedPeriod === "am" && parsedHours === 12) {
            parsedHours = 0;
          }
        }

        startTime.setHours(parsedHours);
        startTime.setMinutes(parseInt(minutes.slice(1), 10));
        startTime.setSeconds(0);

        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 15);

        const eventData = {
          subject: "Reminder from Donna",
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          timeZone: "Eastern Standard Time",
        };

        const response = await fetch("http://localhost:3000/createEvent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        const result = await response.json();
        if (result.message === "Event created successfully!") {
          chat("Please say that reminder is added successfully.");
        } else {
          console.log("Sorry, there was an issue setting up the reminder. Please try again.");
        }
        input.current.value = ""; // Clear the input field
        return;
      }

      if (text.includes("send an email")) {
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
        if (!emailMatch) {
          console.log("No valid email address found in the text.");
          input.current.value = ""; // Clear the input field
          return;
        }

        const recipientEmail = emailMatch[0];
        const bodyMatch = text.match(/(?:body|message)\s*[:\s]*(.*)/i);
        const emailBody = bodyMatch ? bodyMatch[1].trim() : "Email from Donna";

        const emailData = {
          recipient: recipientEmail,
          subject: "Email from Donna",
          body: emailBody,
        };

        const response = await fetch("http://localhost:3000/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData),
        });

        const result = await response.json();
        if (result.message === "Email sent successfully!") {
          chat("Please say that Email has been sent successfully.");
        } else {
          console.log("Sorry, there was an issue sending your email. Please try again.");
        }
        input.current.value = ""; // Clear the input field
        return;
      }

      const containsNoteKeyword = noteKeywords.some((keyword) => text.includes(keyword));
      const containsKBKeyword = kbKeywords.some((keyword) => text.includes(keyword));
      setEnableFileOptions(containsNoteKeyword);
      if (containsNoteKeyword) {
        chat("Please say that upload your files using the Choose file button.");
        input.current.value = ""; // Clear the input field
        return;
      }

      if (containsKBKeyword) {
        const response = await fetch("http://localhost:3000/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input.current.value }),
        });

        const data = await response.text();
        const responseMessage = `Please say this content: ${data}`;
        chat(responseMessage);
        input.current.value = ""; // Clear the input field
        return;
      }

      chat(text); // Fallback if no conditions match
      console.log(text);
      input.current.value = ""; // Clear the input field
    } catch (error) {
      console.error("Error processing message:", error);
      input.current.value = ""; // Clear the input field
    }
  }
};


  
let isNoting = false;
let noteContent = "";

const handleVoiceInput = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition API is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  //recognition.continuous = true;

  recognition.onstart = () => setListening(true);
  recognition.onend = () => {
    setListening(false);
    if (isNoting) {
      downloadTextFile(noteContent.trim());
      isNoting = false;
      noteContent = "";
    }
  };

  recognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const lastTranscript = event.results[lastResultIndex][0].transcript;

    if (!isNoting && (lastTranscript.toLowerCase().startsWith("note") || lastTranscript.toLowerCase().startsWith("take notes"))) {
      isNoting = true;
      noteContent = lastTranscript.substring(lastTranscript.indexOf(" ") + 1);
    } else if (isNoting && event.results[lastResultIndex].isFinal) {
      noteContent = lastTranscript;
    }

    input.current.value = lastTranscript;
  };

  recognition.start();
};

const downloadTextFile = (content) => {
  const element = document.createElement("a");
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = "note.txt";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  chat("Please say note taking is done successfully.");
};

  // Handle file selection
  const handleFileSelection = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
    } else {
      alert("Please select a valid audio file.");
      setFile(null);
    }
  };

  // Handle transcription (call /transcript API)
  const handleSubmit = async () => {
    if (!file) {
      alert("Please select an audio file before submitting.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file); // Match the backend's expected field name

      const response = await fetch("http://localhost:3000/transcript", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error calling /transcript API: ${response.statusText}`);
      }

      const data = await response.json();

      // Download transcription
      const transcripttext = data.messages[0].text;
      const blob = new Blob([transcripttext], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transcription.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      chat("Please say that Transcription successful!");

      // Reset state after successful transcription
      setFile(null);
      setEnableFileOptions(false);
      fileInputRef.current.value = ""; // Reset file input DOM element
    } catch (error) {
      console.error("Error handling transcription:", error);
      alert("Failed to process the transcription. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (hidden) {
    return null;
  }

  return (
  //   <>
  //     <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex">
  //     {/* Sidebar for Donna's Features */}
  //       <div className="w-1/4 bg-gray-100 p-4 flex flex-col gap-4 shadow-md">
  //       <h2 className="text-xl font-bold text-gray-800">Donna's Features</h2>
  //       <ul className="space-y-2">
  //         <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Transcription</li>
  //         <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Note Taking</li>
  //         <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Meeting Summaries</li>
  //         <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Task Management</li>
  //         <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Automatic Follow-Ups</li>
  //         <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Collaboration Tools</li>
  //       </ul>
  //       </div>
  //       <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
  //         <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
  //           <h1 className="font-black text-xl">Donna</h1>
  //           <p>Personalized Virtual Assistant</p>
  //         </div>
  //       <div className="w-full flex flex-col items-end justify-center gap-4">
  //         {/* Zoom Camera Button */}
  //         <button
  //           onClick={() => setCameraZoomed(!cameraZoomed)}
  //           className="pointer-events-auto bg-black-500 hover:bg-gold-600 text-white p-4 rounded-md"
  //         >
  //           {cameraZoomed ? (
  //             <svg
  //               xmlns="http://www.w3.org/2000/svg"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               strokeWidth={1.5}
  //               stroke="currentColor"
  //               className="w-6 h-6"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
  //               />
  //             </svg>
  //           ) : (
  //             <svg
  //               xmlns="http://www.w3.org/2000/svg"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               strokeWidth={1.5}
  //               stroke="currentColor"
  //               className="w-6 h-6"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
  //               />
  //             </svg>
  //           )}
  //         </button>
  //         <button
  //           onClick={() => {
  //             const body = document.querySelector("body");
  //             if (body.classList.contains("greenScreen")) {
  //               body.classList.remove("greenScreen");
  //             } else {
  //               body.classList.add("greenScreen");
  //             }
  //           }}
  //           className="pointer-events-auto bg-black hover:bg-gray-800 text-white p-4 rounded-md"
  //         >
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             fill="none"
  //             viewBox="0 0 24 24"
  //             strokeWidth={1.5}
  //             stroke="currentColor"
  //             className="w-6 h-6"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
  //             />
  //           </svg>
  //         </button> 
  //       </div>
  //       {loading && (
  //         <div className="flex justify-center items-center h-full">
  //           <div className="loader bg-gray-200 p-5 rounded-full flex space-x-3">
  //             <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
  //             <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
  //             <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
  //           </div>
  //         </div>
  //       )}
  //       {!loading && message && message.text && (
  //               <div className="w-full flex justify-center mb-4">
  //           <p className="bg-white bg-opacity-90 p-2 rounded-md shadow-md max-w-sm text-center">
  //             {message.text}
  //           </p>
  //         </div>
  //       )}
        
  //     <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
  //         {/* Text Input */}
  //         <input
  //           className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
  //           placeholder="Type a message..."
  //           ref={input}
  //           onKeyDown={(e) => {
  //             if (e.key === "Enter") {
  //               sendMessage();
  //             }
  //           }}
  //         />
  //         {/* Voice Input Button */}
  //         <button
  //           onClick={handleVoiceInput}
  //           className={`bg-black hover:bg-gray-800 text-white p-4 rounded-full ${listening ? "bg-green-500" : ""}`}
  //         >
  //           <svg
  //             xmlns="http://www.w3.org/2000/svg"
  //             fill="none"
  //             viewBox="0 0 24 24"
  //             strokeWidth={1.5}
  //             stroke="currentColor"
  //             className="w-6 h-6"
  //           >
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               d="M12 1.5a3.75 3.75 0 00-3.75 3.75v6A3.75 3.75 0 0012 15a3.75 3.75 0 003.75-3.75v-6A3.75 3.75 0 0012 1.5zM19.5 10.5v.75A7.5 7.5 0 0112 18.75a7.5 7.5 0 01-7.5-7.5v-.75M12 21.75v-3"
  //             />
  //           </svg>
  //         </button>
  //         <button
  //           disabled={loading || message}
  //           onClick={sendMessage}
  //           className={`bg-black hover:bg-gray-800 text-white p-4 px-10 font-semibold uppercase rounded-md ${
  //             loading || message ? "cursor-not-allowed opacity-30" : ""
  //           }`}
  //         >
  //           Send
  //         </button>
  //       <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
  //       <div className="absolute bottom-14 right-14 pointer-events-auto max-w-screen-sm flex flex-col items-end gap-4">
  //       {/* Title for File Upload */}
  //       <label className="text-sm font-medium mr-2 text-white">
  //         For transcription, Upload files here
  //       </label>

  //       {/* File Upload Input */}
  //       <input
  //           type="file"
  //           accept="audio/*"
  //           ref={fileInputRef} // Attach ref
  //           onChange={handleFileSelection}
  //           className="bg-black hover:bg-gray-100 text-white p-0.5 px-1 rounded-md"
  //           disabled={!enableFileOptions || isUploading}
  //         />

  //       {/* Submit Button */}
  //       <button
  //           onClick={handleSubmit}
  //           className="bg-black hover:bg-gray-800 text-white p-0.5 px-1 font-semibold uppercase rounded-md"
  //           disabled={!enableFileOptions || isUploading || !file}
  //         >
  //           Submit
  //         </button>
  //         </div>
  //         </div>
  //     </div>
  //     </div>
  //   </>
  <>
  {/* <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex">
    
    <div className="w-1/10 bg-gray-100 p-2 flex flex-col gap-2 shadow-md">
      <h2 className="text-xl font-bold text-gray-800">Donna's Features</h2>
      <ul className="space-y-1">
        <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Transcription</li>
        <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Note Taking</li>
        <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Meeting Summaries</li>
        <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Task Management</li>
        <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Automatic Follow-Ups</li>
        <li className="p-2 bg-white rounded shadow hover:bg-gray-200">Collaboration Tools</li>
      </ul>
    </div> */}
  <div className="fixed top-0 left-0 right-0 z-20 bg-gray-100 shadow-md p-4 flex items-center justify-between">
    <h2 className="text-xl font-bold text-gray-800">Donna's Features</h2>
    <div className="flex space-x-2">
      <button className="p-2 bg-white rounded shadow hover:bg-gray-200">Transcription</button>
      <button className="p-2 bg-white rounded shadow hover:bg-gray-200">Note Taking</button>
      <button className="p-2 bg-white rounded shadow hover:bg-gray-200">Meeting Summaries</button>
      <button className="p-2 bg-white rounded shadow hover:bg-gray-200">Task Management</button>
      <button className="p-2 bg-white rounded shadow hover:bg-gray-200">Automatic Follow-Ups</button>
      <button className="p-2 bg-white rounded shadow hover:bg-gray-200">Collaboration Tools</button>
    </div>
  </div>
  <div className="pt-16"> 

    {/* <div className="fixed top-0 right-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none"> */}
    <div className="flex justify-between p-4 flex-col pointer-events-none">
      {/* <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
        <h1 className="font-black text-xl">Donna</h1>
        <p>Personalized Virtual Assistant</p>
      </div> */}

      <div className="w-full flex flex-col items-end justify-center gap-6">
        {/* Zoom Camera Button */}
        <button
          onClick={() => setCameraZoomed(!cameraZoomed)}
          className="pointer-events-auto bg-black-500 hover:bg-gold-600 text-white p-4 rounded-md"
        >
          {cameraZoomed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
              />
            </svg>
          )}
        </button>

        {/* Green Screen Button */}
        <button
          onClick={() => {
            const body = document.querySelector("body");
            body.classList.toggle("greenScreen");
          }}
          className="pointer-events-auto bg-black hover:bg-gray-800 text-white p-4 rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-full">
          <div className="loader bg-gray-200 p-5 rounded-full flex space-x-3">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      {!loading && message && message.text && (
        <div className="w-full flex justify-center mb-4">
          <p className="bg-white bg-opacity-90 p-2 rounded-md shadow-md max-w-sm text-center">
            {message.text}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        {/* Text Input */}
        <input
          className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
          placeholder="Type a message..."
          ref={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        {/* Voice Input Button */}
        <button
          onClick={handleVoiceInput}
          className={`bg-black hover:bg-gray-800 text-white p-4 rounded-full ${listening ? "bg-green-500" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 1.5a3.75 3.75 0 00-3.75 3.75v6A3.75 3.75 0 0012 15a3.75 3.75 0 003.75-3.75v-6A3.75 3.75 0 0012 1.5zM19.5 10.5v.75A7.5 7.5 0 0112 18.75a7.5 7.5 0 01-7.5-7.5v-.75M12 21.75v-3"
            />
          </svg>
        </button>

        {/* Send Button */}
        <button
          disabled={loading || message}
          onClick={sendMessage}
          className={`bg-black hover:bg-gray-800 text-white p-4 px-10 font-semibold uppercase rounded-md ${
            loading || message ? "cursor-not-allowed opacity-30" : ""
          }`}
        >
          Send
        </button>

        {/* File Upload Section */}
        <div className="absolute bottom-14 right-14 pointer-events-auto max-w-screen-sm flex flex-col items-end gap-4">
          <label className="text-sm font-medium mr-2 text-white">
            For transcription, Upload files here
          </label>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileSelection}
            className="bg-black hover:bg-gray-100 text-white p-0.5 px-1 rounded-md"
            disabled={!enableFileOptions || isUploading}
          />
          <button
            onClick={handleSubmit}
            className="bg-black hover:bg-gray-800 text-white p-0.5 px-1 font-semibold uppercase rounded-md"
            disabled={!enableFileOptions || isUploading || !file}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</>

  );
};
