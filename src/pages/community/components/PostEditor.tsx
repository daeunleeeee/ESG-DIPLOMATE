import { useNavigate } from "react-router-dom";
import { useState } from "react";
import $ from "./PostEditor.module.scss";
import DropDownButton, {
  type Option,
} from "@/components/common/Button/DropDownButton";
import AppBar from "@/components/common/Appbar";
import Button from "@/components/common/Button";
import { toast } from "react-toastify";

export interface PostEditorProps<T extends string> {
  mode?: "create" | "edit";
  type: "diary" | "free" | "debate";
  title: string;
  dropdownLabel?: string;
  dropdownOptions?: readonly Option<T>[];
  onSubmit: (data: {
    title: string;
    content: string;
    dropdownValue?: T;
    images: File[];
  }) => void;
  defaultValues?: {
    title?: string;
    content?: string;
    dropdownValue?: T;
    images?: File[];
  };
  submitText?: string;
  loading?: boolean;
}

export default function PostEditor<T extends string>({
  type,
  title,
  dropdownLabel,
  dropdownOptions,
  onSubmit,
  defaultValues,
  submitText,
  mode,
  loading,
}: PostEditorProps<T>) {
  const navigate = useNavigate();
  submitText = mode === "edit" ? "수정하기" : "작성 완료";

  const [postTitle, setPostTitle] = useState(defaultValues?.title || "");
  const [content, setContent] = useState(defaultValues?.content || "");
  const [dropdownValue, setDropdownValue] = useState<T | undefined>(
    defaultValues?.dropdownValue ??
      (dropdownOptions && dropdownOptions.length > 0
        ? dropdownOptions[0].value
        : undefined)
  );

  const [images, setImages] = useState<File[]>(defaultValues?.images || []);

  const maxTitleLength = 20;
  const maxContentLength = 200;
  const maxImages = 3;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    if (images.length + selected.length > maxImages) {
      toast("이미지는 3장까지 업로드할 수 있어요.");
      return;
    }

    setImages([...images, ...selected]);
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const isValid =
    postTitle.trim().length > 0 &&
    content.trim().length > 0 &&
    postTitle.length <= maxTitleLength &&
    content.length <= maxContentLength &&
    (dropdownLabel ? !!dropdownValue : true);

  const imageLabel =
    type === "diary"
      ? `실천 내용을 잘 나타내는 사진을 첨부해주세요.\n(최대 3장)`
      : "사진을 첨부해주세요. (최대 3장)";

  return (
    <div className={$.wrapper}>
      <div className={$.PaddingContainer}>
        <AppBar leftRole="back" onClickLeftButton={() => navigate(-1)} />
      </div>

      <div className={$.container}>
        <div className={$.top}>
          <h2>{title}</h2>
          <span className={$.date}>
            {new Date().toISOString().slice(0, 10).replace(/-/g, ".")}
          </span>
        </div>
        <div className={$.fields}>
          {dropdownLabel && dropdownOptions && (
            <div className={$.fieldRow}>
              <label>{dropdownLabel}</label>
              <DropDownButton
                options={dropdownOptions}
                value={dropdownValue ?? dropdownOptions[0].value}
                onChange={setDropdownValue}
                size="medium"
              />
            </div>
          )}
          <div>
            <div className={$.fieldRow}>
              <label>제목</label>
              <input
                type="text"
                className={$.inputUnderline}
                placeholder="제목을 입력해주세요."
                maxLength={maxTitleLength}
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
            </div>
            <div className={$.counter}>
              {postTitle.length} / {maxTitleLength}
            </div>
          </div>

          <div className={$.contentWrapper}>
            <textarea
              className={$.textarea}
              value={content}
              maxLength={maxContentLength}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요."
            />
            <span className={$.counter}>
              {content.length} / {maxContentLength}
            </span>
          </div>

          <div className={$.field}>
            <label>{imageLabel}</label>
            <div className={$.imageWrapper}>
              {images.map((file, i) => (
                <div
                  key={i}
                  className={$.imageBox}
                  onClick={() => handleImageRemove(i)}
                >
                  <img src={URL.createObjectURL(file)} alt={`uploaded-${i}`} />
                </div>
              ))}
              {images.length < maxImages && (
                <label className={$.uploadBox}>
                  +
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    multiple
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className={$.actions}>
          <Button
            variant="primary"
            size="large"
            disabled={!isValid || loading}
            onClick={() =>
              onSubmit({
                title: postTitle.trim(),
                content: content.trim(),
                dropdownValue,
                images,
              })
            }
          >
            {loading
              ? mode === "edit"
                ? "수정 중..."
                : "업로드 중..."
              : submitText}
          </Button>
        </div>
      </div>
    </div>
  );
}
