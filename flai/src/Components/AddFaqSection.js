import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import FaqModal from './FaqModal';
import '../TopicAccordion.css';  // Apply the CSS styling file

function AddFaqSection({ faqs, onInputChange, onAddQuestion, handleAddChats, onAddExtractedFaqs }) {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="topic-section">
      <FaqModal
        show={showModal}
        handleClose={handleCloseModal}
        handleAddFaqs={onAddExtractedFaqs}
        handleAddChats={handleAddChats}
      />
      <h5 className="section-title">Add context from chat</h5>
      <div className='add-faq-btns'>
        <Button onClick={onAddQuestion}>Add Question</Button>
        <Button onClick={handleShowModal} variant="secondary">Select Chats</Button>
      </div>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-entry">
          <Form.Label className="faq-question-label">Question:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter question..."
            className="mb-2 faq-input"
            value={faq.question}
            onChange={(e) => onInputChange(index, 'question', e.target.value)}
          />
          <Form.Label className="faq-answer-label">Answer: </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter answer..."
            className="faq-input"
            value={faq.answer}
            onChange={(e) => onInputChange(index, 'answer', e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export default AddFaqSection;