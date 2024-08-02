import React, { useState } from 'react';
import { Container, Accordion, InputGroup, Form } from 'react-bootstrap';
import TopicAccordion from './TopicAccordion';

function Context() {
  const [topics, setTopics] = useState([{id: 0, name: 'Context'}]);
  const [newTopic, setNewTopic] = useState('');
  const handleAddTopic = (event) => {
    setTopics([...topics, { id: topics.length, name: newTopic }]);
    setNewTopic('');
  };

  const handleTopicNameChange = (event) => {
    setNewTopic(event.target.value);
  }

  return (
    <Container>
      <Accordion defaultActiveKey="0">
        {topics.map((topic, index) => (
          <TopicAccordion key={topic.id} eventKey={String(index)} title={topic.name} />
        ))}
      </Accordion>
    </Container>
  );
}

export default Context;