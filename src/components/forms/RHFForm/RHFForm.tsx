import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addSubmission } from '../../../store/submissionsSlice';
import { createFormSchema, FormValues } from '../../../schemas/formSchema';
import { imageToBase64 } from '../../../utils/imageToBase64';
import {
  getPasswordStrength,
  STRENGTH_LABELS,
  STRENGTH_COLORS,
  PasswordStrength,
} from '../../../utils/passwordStrength';
import styles from '../formStyles.module.css';

interface Props {
  onClose: () => void;
}

export function RHFForm({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const countries = useAppSelector((state) => state.countries);
  const schema = createFormSchema(countries);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { terms: false },
  });

  // useWatch подписывается только на поле password — не вызывает лишних ре-рендеров
  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });
  const strength = getPasswordStrength(passwordValue) as PasswordStrength;

  const onSubmit = async (data: FormValues) => {
    const { image: imageFile, confirmPassword: _confirmPassword, ...rest } = data;
    const base64 = await imageToBase64(imageFile);
    dispatch(addSubmission({ ...rest, image: base64 }));
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      {/* Имя */}
      <div className={styles.field}>
        <label htmlFor="rhf-name">Имя</label>
        <input
          type="text"
          id="rhf-name"
          autoComplete="given-name"
          {...register('name')}
        />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>

      {/* Возраст */}
      <div className={styles.field}>
        <label htmlFor="rhf-age">Возраст</label>
        <input
          type="number"
          id="rhf-age"
          min={0}
          {...register('age', { valueAsNumber: true })}
        />
        {errors.age && <p className={styles.error}>{errors.age.message}</p>}
      </div>

      {/* Email */}
      <div className={styles.field}>
        <label htmlFor="rhf-email">Email</label>
        <input
          type="text"
          id="rhf-email"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>

      {/* Пол */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Пол</legend>
        <div className={styles.radioGroup}>
          <div className={styles.radioItem}>
            <input
              type="radio"
              id="rhf-gender-male"
              value="male"
              {...register('gender')}
            />
            <label htmlFor="rhf-gender-male">Мужской</label>
          </div>
          <div className={styles.radioItem}>
            <input
              type="radio"
              id="rhf-gender-female"
              value="female"
              {...register('gender')}
            />
            <label htmlFor="rhf-gender-female">Женский</label>
          </div>
          <div className={styles.radioItem}>
            <input
              type="radio"
              id="rhf-gender-other"
              value="other"
              {...register('gender')}
            />
            <label htmlFor="rhf-gender-other">Другой</label>
          </div>
        </div>
        {errors.gender && (
          <p className={styles.error}>{errors.gender.message}</p>
        )}
      </fieldset>

      {/* Пароль */}
      <div className={styles.field}>
        <label htmlFor="rhf-password">Пароль</label>
        <input
          type="password"
          id="rhf-password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className={styles.error}>{errors.password.message}</p>
        )}
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
        <label htmlFor="rhf-confirm-password">Подтвердите пароль</label>
        <input
          type="password"
          id="rhf-confirm-password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Страна */}
      <div className={styles.field}>
        <label htmlFor="rhf-country">Страна</label>
        <input
          type="text"
          id="rhf-country"
          list="rhf-countries-list"
          autoComplete="off"
          {...register('country')}
        />
        <datalist id="rhf-countries-list">
          {countries.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.country && (
          <p className={styles.error}>{errors.country.message}</p>
        )}
      </div>

      {/* Изображение — Controller нужен т.к. file input нельзя регистрировать через register */}
      <div className={styles.field}>
        <label htmlFor="rhf-image">Изображение (PNG или JPEG, до 2 МБ)</label>
        <Controller
          name="image"
          control={control}
          render={({ field: { onChange, ref } }) => (
            <input
              type="file"
              id="rhf-image"
              ref={ref}
              accept="image/png,image/jpeg"
              onChange={(e) => onChange(e.target.files?.[0])}
            />
          )}
        />
        {errors.image && (
          <p className={styles.error}>{errors.image.message as string}</p>
        )}
      </div>

      {/* Условия */}
      <div className={styles.checkboxField}>
        <input
          type="checkbox"
          id="rhf-terms"
          {...register('terms')}
        />
        <label htmlFor="rhf-terms">Принимаю условия использования</label>
        {errors.terms && (
          <p className={styles.error}>{errors.terms.message}</p>
        )}
      </div>

      {/* disabled когда форма невалидна — это главное отличие от неконтролируемой */}
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Отправка…' : 'Отправить'}
      </button>
    </form>
  );
}
