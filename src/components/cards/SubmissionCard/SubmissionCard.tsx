import { useEffect } from 'react';
import { Submission, Gender } from '../../../types';
import { useAppDispatch } from '../../../store/hooks';
import { markAsRead } from '../../../store/submissionsSlice';
import styles from './SubmissionCard.module.css';

interface Props {
  submission: Submission;
}

const GENDER_LABELS: Record<Gender, string> = {
  male: 'Мужской',
  female: 'Женский',
  other: 'Другой',
};

export function SubmissionCard({ submission }: Props) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!submission.isNew) return;
    const timer = setTimeout(() => {
      dispatch(markAsRead(submission.id));
    }, 3000);
    return () => clearTimeout(timer);
  }, [submission.id, submission.isNew, dispatch]);

  return (
    <article
      className={`${styles.card} ${submission.isNew ? styles.cardNew : ''}`}
      aria-label={`Заявка от ${submission.name}`}
    >
      {submission.image && (
        <img
          src={submission.image}
          alt={`Фото ${submission.name}`}
          className={styles.image}
        />
      )}
      <div className={styles.content}>
        {submission.isNew && (
          <span className={styles.newBadge}>Новая</span>
        )}
        <h3 className={styles.name}>{submission.name}</h3>
        <dl className={styles.fields}>
          <div className={styles.fieldRow}>
            <dt>Возраст</dt>
            <dd>{submission.age}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt>Email</dt>
            <dd title={submission.email}>{submission.email}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt>Пол</dt>
            <dd>{GENDER_LABELS[submission.gender]}</dd>
          </div>
          <div className={styles.fieldRow}>
            <dt>Страна</dt>
            <dd>{submission.country}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
