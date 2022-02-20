import { FormModel, FormState, makeFormModel } from 'formtastisch'
import type { BaseInputProps } from 'formtastisch'
import { validateIsRequired } from 'formtastisch'
import { useMemo } from 'react'
import * as React from 'react'

/**
 * good  and recommended practice is to customize yor form state.
 * in this example we will use multistep form
 *
 * here we create model separately, notice that we use makeFormModel instead of makeFormStateWithModel
 */

const initialData = {
  customer: {
    name: ''
  },
  payment: {
    paymentKind: ''
  },
  shippingMethod: {
    providerName: ''
  }
}

const formModel = makeFormModel({
  initialData,
  validations: {},
  tap: (data) => {
    return {
      customer: makeFormModel({
        initialData: data.customer,
        validations: {
          name: (value) => validateIsRequired(value)
        }
      }),
      payment: makeFormModel({
        initialData: data.payment,
        validations: {
          paymentKind: (value) => validateIsRequired(value)
        }
      }),
      shippingMethod: makeFormModel({
        initialData: data.shippingMethod,
        validations: {
          providerName: (value) => validateIsRequired(value)
        }
      })
    }
  }
})

type Steps = 'customer' | 'shipping' | 'payment'

class CheckoutForm extends FormState<typeof formModel> {
  currentStep: FormModel = this.model.customer

  isCurrentStepValid = () => {
    this.currentStep.validator.validateDefault()
    return this.currentStep.validator.isValid()
  }

  goTo = (stepModel: FormModel) => {
    this.currentStep = stepModel
    this.update()
  }

  submit = () => {
    if (!this.isValid({ validate: true })) {
      alert('invalid')
      this.update()
    } else {
      console.log(this.getData())
    }
  }
}

export default function CustomizingFormState() {
  const formState = useMemo(() => new CheckoutForm(formModel), [])
  formState.use()
  const stepModel = formState.currentStep

  if (stepModel === (formState.model.customer as any)) {
    return <CustomerStep formState={formState} model={stepModel as any} />
  }
  if (stepModel === (formState.model.shippingMethod as any)) {
    return <ShippingStep formState={formState} model={stepModel as any} />
  }
  if (stepModel === (formState.model.payment as any)) {
    return <PaymentStep formState={formState} model={stepModel as any} />
  }
  return <>invalid state</>
}

function CustomerStep({
  formState,
  model
}: {
  formState: CheckoutForm
  model: typeof formModel['customer']
}) {
  formState.use()

  return (
    <div className="componentSection">
      <p>Customer</p>
      <MyInput formState={formState as any} model={model} property="name" />
      <StepControl
        formState={formState}
        nextStepModel={formState.model.shippingMethod}
        text="proceed to shipping"
      />
    </div>
  )
}

function ShippingStep({
  formState,
  model
}: {
  formState: CheckoutForm
  model: typeof formModel['shippingMethod']
}) {
  formState.use()

  return (
    <div className="componentSection" key="shipping">
      <p>Shipping</p>
      <MyInput
        formState={formState as any}
        model={model}
        property="providerName"
      />
      <StepControl
        formState={formState}
        nextStepModel={formState.model.payment}
        previousStepModel={formState.model.customer}
        text="proceed to payment"
      />
    </div>
  )
}

function PaymentStep({
  formState,
  model
}: {
  formState: CheckoutForm
  model: typeof formModel['payment']
}) {
  formState.use()

  return (
    <div className="componentSection">
      <MyInput
        formState={formState as any}
        model={model}
        property="paymentKind"
      />
      <button
        className={'btn'}
        onClick={() => {
          formState.goTo(formState.model.shippingMethod)
        }}
      >
        back
      </button>
      <button onClick={formState.submit}>checkout!</button>
    </div>
  )
}

function MyInput<T extends FormModel>({
  formState,
  model,
  property
}: BaseInputProps<T>) {
  // use for input will use use() behind the scenes and will dep the model, property and errors for property
  const controls = formState.useForInput(model, property as any)
  const error = controls.getFirstError()

  return (
    <div className="componentSection">
      <label>{property}</label>
      <input
        type="text"
        value={controls.getValue() as any}
        onChange={controls.onChange}
      />
      {error && <p className="inputError">{error}</p>}
    </div>
  )
}

function StepControl({
  nextStepModel,
  previousStepModel,
  text,
  formState
}: {
  formState: CheckoutForm
  nextStepModel?: FormModel
  previousStepModel?: FormModel
  text: string
}) {
  return (
    <>
      {nextStepModel && (
        <button
          className={'btn'}
          onClick={() => {
            formState.currentStep.validator.validate()
            if (!formState.currentStep.validator.isValid()) {
              formState.update()
              return
            }
            formState.goTo(nextStepModel)
          }}
        >
          {text}
        </button>
      )}
      {previousStepModel && (
        <button
          className={'btn'}
          onClick={() => {
            formState.goTo(previousStepModel)
          }}
        >
          go back
        </button>
      )}
    </>
  )
}
