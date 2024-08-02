import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Alert } from 'react-bootstrap';

function FaqModal({ show, handleClose, handleAddChats }) {
  const [contacts, setContacts] = useState([{id: 1, name: "Group"}]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const handleContactChange = (contactId) => {
    setSelectedContacts(prevSelected =>
      prevSelected.includes(contactId)
        ? prevSelected.filter(id => id !== contactId)
        : [...prevSelected, contactId]
    );
  };

  const handleSelectAllChange = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const onAddChatsSubmit = (event) => {
    const temp = selectedContacts.map(contact => contacts.find(obj => obj.id === contact));
    const chats = temp.map(contact => contact.name);
    // const chats = selectedContacts.map(contact => contacts.find(obj => obj.id === contact.id).name);
    console.log(chats);
    handleAddChats(chats);
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Extract FAQs from chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Select Contacts</h6>
        <Form.Check
          type="checkbox"
          label="Select All"
          checked={selectedContacts.length === contacts.length}
          onChange={handleSelectAllChange}
        />
        <div className="contacts-list" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
          {contacts.map(contact => (
            <Form.Check
              key={contact.id}
              type="checkbox"
              label={contact.name}
              checked={selectedContacts.includes(contact.id)}
              onChange={() => handleContactChange(contact.id)}
            />
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={onAddChatsSubmit}>Add Selected Chats</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FaqModal;