import React from 'react';
import { Form, Button, Alert, ListGroup } from 'react-bootstrap';
import '../TopicAccordion.css';  // Apply the same CSS styling file

const AddDocument = ({ documents, selectedFile, onFileChange, onUploadDocument }) => {
  return (
    <div className="topic-section">
      <h5>Upload Document</h5>
      <Form>
        <Form.Group controlId="documentUpload">
          <Form.Label>Document</Form.Label>
          <Form.Control
            type="file"
            onChange={onFileChange}
          />
        </Form.Group>
        <Button 
          variant="primary" 
          type="button" 
          disabled={!selectedFile}
          onClick={onUploadDocument}
        >
          Upload
        </Button>
      </Form>
      <h6 className="mt-4">Uploaded Documents</h6>
      <ListGroup>
        {documents.map((doc, index) => (
          <ListGroup.Item key={index}>{doc.name}</ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default AddDocument;