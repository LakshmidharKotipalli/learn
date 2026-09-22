# Practice Pack: 05 Deep Learning

Work this pack at least one day after reading the module. Write your answer before opening each solution; recognition is not retrieval.

## 1. Retrieval questions

1. What is a forward pass?

<details><summary>Answer</summary>

Applying the model's parameters to inputs to produce predictions.

</details>

2. What does backpropagation compute?

<details><summary>Answer</summary>

Gradients of the loss with respect to parameters using the chain rule.

</details>

3. What does the learning rate control?

<details><summary>Answer</summary>

The size of parameter updates in the optimization step.

</details>

4. What does overfitting look like in learning curves?

<details><summary>Answer</summary>

Training performance keeps improving while validation performance stops improving or worsens.

</details>

5. Why use transfer learning?

<details><summary>Answer</summary>

A useful representation or model can reduce data, compute, and time needed for a related task.

</details>

## 2. Prediction exercises

1. If the learning rate is multiplied by 100 and the loss oscillates or becomes NaN, what changed?

<details><summary>Answer</summary>

Updates became too large for stable optimization; reduce the rate or address numerical issues.

</details>

2. Training loss falls while validation loss rises for many epochs. What should you consider?

<details><summary>Answer</summary>

Overfitting, regularization, early stopping, data leakage, or a train/validation mismatch.

</details>

3. If gradients are near zero through many early layers, what behavior should you expect?

<details><summary>Answer</summary>

Those layers will learn very slowly, leading to stalled training or poor representation learning.

</details>

## 3. Debugging scenarios

1. The loss never changes because the optimizer sees no gradients. What should you check?

<details><summary>Answer</summary>

That parameters require gradients, the loss is connected to the graph, `backward()` runs, and the optimizer owns the parameters.

</details>

2. Validation improves only when the model is evaluated without dropout. Why?

<details><summary>Answer</summary>

Dropout should normally be disabled in evaluation mode; check `model.eval()` and `model.train()` transitions.

</details>

3. A fine-tuned model memorizes the tiny dataset. What can help?

<details><summary>Answer</summary>

More representative data, frozen layers, regularization, augmentation where valid, and early stopping.

</details>

## 4. Short explanation prompts

1. Explain a gradient without calculus jargon.

<details><summary>Answer</summary>

It is the direction and local sensitivity that says how each parameter should change to reduce the loss.

</details>

2. Explain why batch size is a tradeoff.

<details><summary>Answer</summary>

Larger batches use more memory and give smoother estimates; smaller batches use less memory and add noisier updates that can sometimes help generalization.

</details>

3. Explain what a learning curve can diagnose.

<details><summary>Answer</summary>

The relative training and validation trajectories distinguish underfitting, overfitting, optimization failure, and data problems.

</details>

## 5. Implementation task

Train a tiny PyTorch classifier on synthetic data. Save the loss curves, deliberately run one broken configuration, diagnose it from the curves, then repair it and explain the change.

Do not open the rubric until you have a working attempt.

## 6. Rubric

- [ ] The forward, loss, backward, and update steps are visible.
- [ ] Training and validation data are separated.
- [ ] The broken run has an intentional, documented cause.
- [ ] The diagnosis uses the curve shape as evidence.
- [ ] The repaired run is reproducible from a command.

## 7. Scoring

- **4 — Ready:** answers are produced without notes, the implementation works, and the explanation names tradeoffs.
- **3 — Practiced:** one weak area remains; schedule a review in 7 days and redo that section.
- **2 — Learning:** revisit the module's first-pass path and retry the prediction/debugging sections tomorrow.
- **1 — Not yet:** ask for help or use the worked example, then restart with a smaller task.

