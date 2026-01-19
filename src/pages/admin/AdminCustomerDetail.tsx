import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminCustomerDetail = () => {
	const { id } = useParams();

	useEffect(() => {
		// Placeholder: fetch customer details here when implemented
	}, [id]);

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>Detalhes do Cliente</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Cliente ID: {id}</p>
					<p className="text-sm text-muted-foreground">Ainda não implementado — conteúdo de exemplo.</p>
					<div className="mt-4">
						<Button asChild>
							<Link to="/admin/pedidos">Voltar para Clientes</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AdminCustomerDetail;
