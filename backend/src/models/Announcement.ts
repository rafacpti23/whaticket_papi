import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Announcement extends Model<Announcement> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  priority: number; //1 - alta, 2 - média, 3 - baixa

  @Column
  title: string;

  @Column(DataType.TEXT)
  text: string;

  @Column
  get mediaPath(): string | null {
    if (this.getDataValue("mediaPath")) {

      const backendUrl = process.env.BACKEND_URL;
      const proxyPort = process.env.PROXY_PORT;
      const portSuffix = proxyPort && !backendUrl.includes(`:${proxyPort}`) && !backendUrl.match(/:\d+$/) ? `:${proxyPort}` : "";

      return `${backendUrl}${portSuffix}/public/announcements/${this.getDataValue("mediaPath")}`;

    }
    return null;
  }

  @Column
  mediaName: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  status: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default Announcement;
