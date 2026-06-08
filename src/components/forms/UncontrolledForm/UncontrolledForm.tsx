import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addSubmission } from '../../../store/submissionsSlice';
import { createFormSchema } from '../../../schemas/formSchema';
import { imageToBase64 } from '../../../utils/imageToBase64';
import {
  getPasswordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
} from '../../../utils/passwordStrength';
import type { PasswordStrength } from '../../../utils/passwordStrength';
import styles from '../formStyles.module.css';

interface Props {
  onClose: () => void;
}

type FieldErrors = Partial<Record<string, string>>;

export function UncontrolledForm({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const countries = useAppSelector((state) => state.countries);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [passwordValue, setPasswordValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(passwordValue) as PasswordStrength;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const schema = createFormSchema(countries);

    const raw = {
      name: fd.get('name'),
      age: fd.get('age'),
      email: fd.get('email'),
      password: fd.get('password'),
      confirmPassword: fd.get('confirmPassword'),
      gender: fd.get('gender'),
      terms: fd.has('terms'),
      country: fd.get('country'),
      image: fd.get('image'),
    };

    const result = schema.safeParse(raw);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // confirmPassword не хранится в store — только для сверки паролей в схеме
      const { image: imageFile, confirmPassword: _confirmPassword, ...rest } =
        result.data;
      const base64 = await imageToBase64(imageFile);
      dispatch(addSubmission({ ...rest, image: base64 }));
      onClose();
    } catch {
      setErrors({ image: 'Не удалось прочитать файл' });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      {/* Имя */}
      <div className={styles.field}>
        <label htmlFor="uc-name">Имя</label>
        <input type="text" id="uc-name" name="name" autoComplete="given-name" />
        {errors.name && <p className={styles.error}>{errors.name}</p>}
      </div>

      {/* Возраст */}
      <div className={styles.field}>
        <label htmlFor="uc-age">Возраст</label>
        <input type="number" id="uc-age" name="age" min={0} />
        {errors.age && <p className={styles.error}>{errors.age}</p>}
      </div>

      {/* Email */}
      <div className={styles.field}>
        <label htmlFor="uc-email">Email</label>
        <input type="text" id="uc-email" name="email" autoComplete="email" />
        {errors.email && <p className={styles.error}>{errors.email}</p>}
      </div>

      {/* Пол */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Пол</legend>
        <div className={styles.radioGroup}>
          <div className={styles.radioItem}>
            <input type="radio" id="uc-gender-male" name="gender" value="male" />
            <label htmlFor="uc-gender-male">Мужской</label>
          </div>
          <div className={styles.radioItem}>
            <input
              type="radio"
              id="uc-gender-female"
              name="gender"
              value="female"
            />
            <label htmlFor="uc-gender-female">Женский</label>
          </div>
          <div className={styles.radioItem}>
            <input
              type="radio"
              id="uc-gender-other"
              name="gender"
              value="other"
            />
            <label htmlFor="uc-gender-other">Другой</label>
          </div>
        </div>
        {errors.gender && <p className={styles.error}>{errors.gender}</p>}
      </fieldset>

      {/* Пароль */}
      <div className={styles.field}>
        <label htmlFor="uc-password">Пароль</label>
        <input
          type="password"
          id="uc-password"
          name="password"
          autoComplete="new-password"
          onChange={(e) => setPasswordValue(e.target.value)}
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}
      </div>

      {/* Индикатор силы пароля */}
      {passwordValue && (
        <div className={styles.strengthWrap} aria-live="polite">
          <div className={styles.strengthBar}>
            {([1, 2, 3, 4] as PasswordStrength[]).map((level) => (
              <span
                key={level}
                className={styles.strengthSegment}
                style={{
                  backgroundColor:
                    strength >= level ? STRENGTH_COLORS[strength] : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <span
            className={styles.strengthLabel}
            style={{ color: STRENGTH_COLORS[strength] }}
          >
            {STRENGTH_LABELS[strength]}
          </span>
        </div>
      )}

      {/* Подтверждение пароля */}
      <div className={styles.field}>
        <label htmlFor="uc-confirm-password">Подтвердите пароль</label>
        <input
          type="password"
          id="uc-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword}</p>
        )}
      </div>

      {/* Страна */}
      <div className={styles.field}>
        <label htmlFor="uc-country">Страна</label>
        <input
          type="text"
          id="uc-country"
          name="country"
          list="uc-countries-list"
          autoComplete="off"
        />
        <datalist id="uc-countries-list">
          {countries.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.country && <p className={styles.error}>{errors.country}</p>}
      </div>

      {/* Изображение */}
      <div className={styles.field}>
        <label htmlFor="uc-image">Изображение (PNG или JPEG, до 2 МБ)</label>
        <input
          type="file"
          id="uc-image"
          name="image"
          accept="image/png,image/jpeg"
        />
        {errors.image && <p className={styles.error}>{errors.image}</p>}
      </div>

      {/* Условия */}
      <div className={styles.checkboxField}>
        <input type="checkbox" id="uc-terms" name="terms" />
        <label htmlFor="uc-terms">Принимаю условия использования</label>
        {errors.terms && <p className={styles.error}>{errors.terms}</p>}
      </div>

      <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
        {isSubmitting ? 'Отправка…' : 'Отправить'}
      </button>
    </form>
  );
}
