import React, { useEffect, useState } from 'react';
import { Accordion, Card, Button, Form, Alert, ListGroup } from 'react-bootstrap';
import AddFaqSection from './AddFaqSection';
import AddDocument from './AddDocument';
import axios from 'axios';
import '../TopicAccordion.css';  // Importing the CSS file

function TopicAccordion({ eventKey, title }) {
  // Parent state management
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [chats, setChats] = useState([]);
  const [intro, setIntro] = useState([]);
  const [loading, setLoading] = useState(false);
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  useEffect(() => {
    console.log(documents);
  }, [documents]);
  
  // Document handlers
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadDocument = () => {
    setDocuments([...documents, selectedFile]);
    setSelectedFile(null);
  };

  // FAQ handlers
  const handleInputChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleAddQuestion = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleAddExtractedFaqs = (selectedFaqs) => {
    setFaqs([...faqs, ...selectedFaqs]);
  };

  const handleAddChats = async (selectedChats) => {
    try {
        console.log(selectedChats);
        const response = await axios.post('http://localhost:3668/chats', { contacts: selectedChats });
        const firstIndex = response.data.faqs.indexOf('[');
        const lastIndex = response.data.faqs.lastIndexOf(']');
        const extractedFaqs = JSON.parse(response.data.faqs.substring(firstIndex, lastIndex + 1));
        const mappedFaqs = extractedFaqs.map((faq) => ({
            question: faq.Q,
            answer: faq.A
        }));
        setFaqs(mappedFaqs);
        stopLoading();
    } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to fetch messages. Please try again.');
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    const formData = new FormData();
    formData.append('topic', title);
    formData.append('faqs', JSON.stringify(faqs));
    documents.forEach((doc, index) => {
      formData.append(`documents`, doc);
    });
    formData.append('chats', JSON.stringify(chats));
    try {
      const response = await axios.post('http://localhost:3668/topics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Failed to submit data');
    }
  };

  return (
    <Accordion.Item eventKey={eventKey} className="accordion-item">
      {/* <Accordion.Header className="accordion-header">{title}</Accordion.Header> */}
      <Accordion.Body className="topic-section">
        {success && <Alert variant="success">Data submitted successfully!</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleFormSubmit}>
          <AddDocument 
            selectedFile={selectedFile} 
            onFileChange={handleFileChange} 
            onUploadDocument={handleUploadDocument} 
            documents={documents} 
          />
          
          <AddFaqSection
            faqs={faqs}
            onInputChange={handleInputChange}
            onAddQuestion={handleAddQuestion}
            onAddExtractedFaqs={handleAddExtractedFaqs}
            handleAddChats={handleAddChats}
            startLoading={startLoading}
            stopLoading={stopLoading}
            loading={loading}
          />
          <Button variant="primary" type="submit">
            Submit All
          </Button>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default TopicAccordion;