import React, { useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { AutoForm, ErrorsField, NumField, SelectField, SubmitField, TextField } from 'uniforms-bootstrap5';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import * as PropTypes from 'prop-types';
import { Stuffs } from '../../api/stuff/Stuff';
import { Navigate } from 'react-router-dom';

// Create a schema to specify the structure of the data to appear in the form.
const formSchema = new SimpleSchema({
  size: {
    type: String,
    allowedValues: ['small', 'medium', 'large'],
    defaultValue: 'small',
  },
  name: String,
  quantity: Number,
});

const bridge = new SimpleSchema2Bridge(formSchema);


TextField.propTypes = { name: PropTypes.string };
/* Renders the AddStuff page for adding a document. */
const Checkout = ({ onSubmission }) => {
  const [redirect, setRedirect] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  // On submit, insert the data.
  const submit = (data, formRef) => {
    const { size, quantity, name } = data;
    const owner = Meteor.user().username;
    const orderId = generateOrderId();
    Stuffs.collection.insert(
      { size, quantity, owner, name },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          swal('Success', 'Item added successfully', 'success');
          setRedirect(true);
          setSubmittedData({ size, quantity, name, orderId });
          formRef.reset();
          onSubmission({ size, quantity, name, orderId});
        }
      },
    );
  };
  const generateOrderId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero based
    const day = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const orderId = `${year}${month}${day}${hour}${minutes}${seconds}`;
    return orderId;
  }
  if (redirect) {
    return <Navigate to="/confirmation" state={{ submittedData }} />;
  }
  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  let fRef = null;
  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={5}>
          <Col className="text-center"><h2>Checkout Containers</h2></Col>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => submit(data, fRef)}>
            <Card>
              <Card.Body>
                <TextField name="name" />
                <SelectField name="size" />
                <NumField name="quantity" decimal={null} />
                <SubmitField value="Submit" />
                <ErrorsField />
              </Card.Body>
            </Card>
          </AutoForm>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
