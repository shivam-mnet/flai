import React from 'react';
import { Button } from 'react-bootstrap';

function AddTopicButton({ onClick }) {
  return (
    <Button onClick={onClick} className="mb-3">
      Add Topic
    </Button>
  );
}

export default AddTopicButton;