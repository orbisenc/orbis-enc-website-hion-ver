export function SectionPage({ title, description, headers, rows, action }: { title: string; description: string; headers: string[]; rows: string[][]; action?: string }) {
  return <><h1>{title}</h1><p className="muted">{description}</p>{action && <button className="btn btn-primary" style={{ marginBottom: 18 }}>{action}</button>}<div className="table-wrap"><table><thead><tr>{headers.map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((item, cell) => <td key={cell}>{item}</td>)}</tr>)}</tbody></table></div></>;
}

