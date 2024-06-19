import { RiDeleteBinLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "./index.css";

function Todotasks() {
  const [todoTask, settodoTask] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const handlePdfUpload = async () => {
    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      const response = await fetch("https://shanture.onrender.com/upload-pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Error uploading PDF");
      alert("PDF uploaded successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch(
        `https://shanture.onrender.com/tasks/${todoId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }
      // Optimistically update the UI by removing the deleted todo from state
      const updatedTasks = todoTask.filter((todo) => todo.id !== todoId);
      settodoTask(updatedTasks);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const getTodos = async () => {
    let url = "https://shanture.onrender.com/tasks";
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      console.error("Error fetching tasks:", error.error);
    } else {
      const responseData = await response.json();
      settodoTask(responseData);
    }
  };

  const changeStatus = async (todoId, todoStatus) => {
    let url = `https://shanture.onrender.com/tasks/${todoId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: todoStatus }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error: ${error}`);
    }

    // Optimistically update the UI
    const updatedTasks = todoTask.map((task) =>
      task.id === todoId ? { ...task, completed: todoStatus } : task
    );
    settodoTask(updatedTasks);
  };

  const handelTaskInsert = async (description, completed = false) => {
    if (!description) {
      alert("Type something to add...");
    } else {
      let url = `https://shanture.onrender.com/tasks`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, completed }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error("Error adding task:", error.error);
      } else {
        const newTask = await response.json();
        settodoTask((prevTasks) => [...prevTasks, newTask]);
        setUserInput(""); // Clear the input field after adding the task
      }
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    todoTask.forEach((task, index) => {
      doc.text(
        `${index + 1}. ${task.description} - ${
          task.completed ? "Completed" : "Incomplete"
        }`,
        10,
        yOffset
      );
      yOffset += 10;
    });

    doc.save("tasks.pdf");
  };

  return (
    <div className="container">
      <div className="todo-app">
        <div className="logo-container">
          <h2>
            To-Do List{" "}
            <img
              alt="logo"
              src="https://res.cloudinary.com/dufyrxyey/image/upload/v1718733860/icon_y0hvqp.png"
            />
          </h2>
          <img
            className="shanture"
            alt="logo"
            src="https://res.cloudinary.com/dufyrxyey/image/upload/v1718781688/shanture_logo__1_-removebg-preview_byslyu.png"
          />
        </div>
        <div className="row">
          <input
            type="text"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            placeholder="Add your text"
          />
          <button onClick={() => handelTaskInsert(userInput)}>Add</button>
        </div>
        <ul>
          {todoTask.map((e) => (
            <div className="taske">
              <li
                className={e.completed ? "checked" : "unchecked"}
                key={e.id}
                onClick={() => changeStatus(e.id, !e.completed)}
              >
                <label className={e.completed ? "checkedFont" : "checkFont"}>
                  {e.description}
                </label>
              </li>
              <span onClick={() => deleteTodo(e.id)}>
                <RiDeleteBinLine className="icon" />
              </span>
            </div>
          ))}
        </ul>
      </div>
      <div className="down-upload">
        <div className="upload">
          <input
            type="file"
            className="form-control"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
          <button className="btn btn-outline-primary" onClick={handlePdfUpload}>
            Upload PDF
          </button>
        </div>
        <div className="downloadContainer">
          <button onClick={downloadPDF} className="download">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Todotasks;
